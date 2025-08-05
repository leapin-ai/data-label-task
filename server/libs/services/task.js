const fp = require('fastify-plugin');
const { NotFound } = require('http-errors');
const exceljs = require('exceljs');
const JSZip = require('jszip');
const transform = require('lodash/transform');

module.exports = fp(async (fastify, options) => {
  const { models, services } = fastify[options.name];
  const { Op } = fastify.sequelize.Sequelize;

  const create = async (authenticatePayload, data) => {
    return await models.task.create(Object.assign({}, data, { createdUserId: authenticatePayload.id }));
  };

  const list = async ({ perPage, currentPage, projectId, taskStatus }) => {
    const where = {};
    if (projectId) {
      where.projectId = projectId;
    }
    if (taskStatus) {
      where.status = taskStatus;
    }

    const { count, rows } = await models.task.findAndCountAll({
      include: [
        {
          model: options.getUserModel(),
          foreignKey: 'createdUserId',
          as: 'createdUser',
          attributes: ['id', 'avatar', 'nickname', 'email']
        },
        {
          model: options.getUserModel(),
          foreignKey: 'allocatorUserId',
          as: 'allocatorUser',
          attributes: ['id', 'avatar', 'nickname', 'email']
        },
        {
          model: models.project,
          attributes: ['id', 'name']
        }
      ],
      where,
      offset: perPage * (currentPage - 1),
      limit: perPage,
      order: [['createdAt', 'DESC']]
    });

    return {
      pageData: rows,
      totalCount: count
    };
  };

  const detail = async ({ id }) => {
    const task = await models.task.findByPk(id, {
      include: [
        {
          model: options.getUserModel(),
          foreignKey: 'createdUserId',
          as: 'createdUser',
          attributes: ['id', 'avatar', 'nickname', 'email']
        },
        {
          model: options.getUserModel(),
          foreignKey: 'allocatorUserId',
          as: 'allocatorUser',
          attributes: ['id', 'avatar', 'nickname', 'email']
        },
        {
          model: models.project,
          attributes: ['id', 'name', 'fields']
        }
      ]
    });
    if (!task) {
      throw new NotFound('Task not found');
    }

    return task;
  };

  const caseList = async ({ id, perPage, currentPage, type }) => {
    const whereQuery = {};

    const task = await detail({ id });

    let dataSourceIds;

    if (['in', 'notIn'].indexOf(type) > -1) {
      dataSourceIds = (
        await models.taskCase.findAll({
          where: { taskId: task.id },
          attributes: ['dataSourceId']
        })
      ).map(item => item.dataSourceId);
    }

    if (type === 'in') {
      whereQuery['id'] = {
        [Op.in]: dataSourceIds
      };
    }

    if (type === 'notIn') {
      whereQuery['id'] = {
        [Op.notIn]: dataSourceIds
      };
    }

    const { count: totalCount, rows: pageData } = await models.dataSource.findAndCountAll({
      where: {
        ...whereQuery,
        projectId: task.projectId
      },
      offset: perPage * (currentPage - 1),
      limit: perPage,
      order: [['createdAt', 'DESC']]
    });
    const caseList = await models.taskCase.findAll({
      where: {
        taskId: task.id,
        dataSourceId: {
          [Op.in]: pageData.map(item => item.id)
        }
      }
    });

    return {
      pageData: pageData.map(item => {
        const taskCase = caseList.find(caseItem => caseItem.dataSourceId === item.id);
        return Object.assign({}, item.get({ plain: true }), {
          taskCase
        });
      }),
      totalCount
    };
  };

  const appendCase = async ({ id, dataSourceIds }) => {
    const task = await detail({ id });
    if (task.status !== 'pending') {
      throw new Error('Task status is not pending,not allow to append case');
    }
    for (const dataSourceId of dataSourceIds) {
      if (
        await models.taskCase.findOne({
          where: { dataSourceId, taskId: task.id }
        })
      ) {
        continue;
      }
      await models.taskCase.create({ dataSourceId, taskId: task.id, allocatorUserId: task.allocatorUserId });
    }
  };

  const removeCase = async ({ id, dataSourceIds }) => {
    const task = await detail({ id });
    if (task.status !== 'pending') {
      throw new Error('Task status is not pending,not allow to remove case');
    }
    for (const dataSourceId of dataSourceIds) {
      const taskCase = await models.taskCase.findOne({
        where: { dataSourceId, taskId: task.id }
      });
      if (taskCase) {
        await taskCase.destroy();
      }
    }
  };

  const action = async (authenticatePayload, { id, status }) => {
    const task = await detail({ id });
    const validTransitions = {
      pending: ['inProgress', 'closed'],
      inProgress: ['closed'],
      completed: ['confirmed', 'closed'],
      confirmed: ['closed'],
      closed: ['pending']
    };
    if (!validTransitions[task.status] || !validTransitions[task.status].includes(status)) {
      throw new Error(`Invalid status transition from ${task.status} to ${status}`);
    }

    if (
      status === 'inProgress' &&
      (await models.taskCase.count({
        where: {
          taskId: task.id
        }
      })) === 0
    ) {
      throw new Error('There are no cases to be processed');
    }

    if (status === 'inProgress' && task.allocatorUserId === null) {
      throw new Error('There are no allocatorUser');
    }

    await task.update({
      status,
      tracking: [
        ...task.tracking,
        {
          currentStatus: task.status,
          nextStatus: status,
          time: new Date(),
          operator: {
            id: authenticatePayload.id,
            name: authenticatePayload.nickname || authenticatePayload.email || authenticatePayload.phone,
            avatar: authenticatePayload.avatar,
            type: 'admin'
          }
        }
      ]
    });
  };

  const allocator = async (authenticatePayload, { id, allocatorUserId }) => {
    const task = await detail({ id });
    if (task.status !== 'pending') {
      throw new Error('Task status is not pending,not allow to allocate case');
    }
    await task.update({
      allocatorUserId
    });

    await models.taskCase.update(
      {
        allocatorUserId
      },
      {
        where: {
          taskId: task.id
        }
      }
    );
  };

  const split = async (authenticatePayload, { projectId, count = 200, name, completeTime, description }) => {
    const project = await services.project.detail({ id: projectId });
    const taskList = await models.task.findAll({
      attributes: ['id'],
      where: {
        projectId,
        status: {
          [Op.notIn]: ['closed']
        }
      }
    });
    const taskCaseList =
      taskList.length > 0
        ? await models.taskCase.findAll({
            attributes: ['dataSourceId'],
            where: {
              taskId: {
                [Op.in]: taskList.map(({ id }) => id)
              }
            }
          })
        : [];

    const dataSourceList = await models.dataSource.findAll({
      attributes: ['id'],
      where: Object.assign(
        {},
        {
          projectId: project.id
        },
        taskCaseList.length > 0 && {
          id: {
            [Op.notIn]: taskCaseList.map(({ dataSourceId }) => dataSourceId)
          }
        }
      )
    });

    const taskCount = Math.ceil(dataSourceList.length / count);
    const dataSourceIds = dataSourceList.map(({ id }) => id);

    for (let i = 0; i < taskCount; i++) {
      const task = await models.task.create({
        projectId: project.id,
        name: `${name}[${i + 1}]`,
        completeTime,
        description,
        createdUserId: authenticatePayload.id
      });
      const target = dataSourceIds.splice(0, count);
      await models.taskCase.bulkCreate(
        target.map(dataSourceId => {
          return { dataSourceId, taskId: task.id };
        })
      );
    }
  };

  const copy = async (authenticatePayload, { id }) => {
    const task = await detail({ id });
    const taskCaseList = await models.taskCase.findAll({
      where: {
        taskId: id
      }
    });

    const newTask = await models.task.create({
      projectId: task.projectId,
      name: `${task.name}[副本]`,
      completeTime: task.completeTime,
      description: task.description,
      createdUserId: authenticatePayload.id
    });

    if (taskCaseList.length > 0) {
      await models.taskCase.bulkCreate(
        taskCaseList.map(item => ({
          dataSourceId: item.dataSourceId,
          taskId: newTask.id
        }))
      );
    }

    return newTask;
  };

  const exportResult = async (authenticatePayload, { ids }) => {
    const task = await models.task.findAll({
      include: [
        {
          model: models.taskCase,
          include: [models.dataSource]
        },
        models.project
      ],
      where: {
        id: {
          [Op.in]: ids
        },
        status: {
          [Op.in]: ['completed', 'confirmed']
        }
      }
    });

    const generator = async t => {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('任务信息');
      worksheet.columns = [
        { header: '任务ID', key: 'id', width: 10 },
        { header: '任务名称', key: 'name', width: 20 },
        { header: '任务描述', key: 'description', width: 40 },
        { header: '项目名称', key: 'projectName', width: 20 },
        { header: '状态', key: 'status', width: 15 },
        { header: '完成时间', key: 'completeTime', width: 20 }
      ];
      // 添加数据行
      worksheet.addRow({
        id: t.id,
        name: t.name,
        description: t.description,
        projectName: t.project.name,
        status: t.status,
        completeTime: t.completeTime
      });

      const taskCaseWorksheet = workbook.addWorksheet('标注数据');

      taskCaseWorksheet.columns = t.project.fields.map(({ name, label }) => {
        return {
          header: label,
          key: name
        };
      });

      t.taskCases.forEach(({ result, dataSource }) => {
        taskCaseWorksheet.addRow(
          transform(
            t.project.fields,
            (target, value) => {
              const { name, needAnnotate } = value;
              if (needAnnotate) {
                target[name] = result[name];
              } else {
                target[name] = dataSource[name];
              }
            },
            {}
          )
        );
      });

      return {
        file: await workbook.xlsx.writeBuffer(),
        filename: `${t.id}-${t.name}-${t.project.name}.xlsx`
      };
    };

    if (task.length > 1) {
      const zip = new JSZip();
      for (const t of task) {
        const { file, name } = await generator(t);
        zip.file(name, file);
      }
      return {
        file: await zip.generateAsync({ type: 'nodebuffer' }),
        filename: 'tasks.zip'
      };
    } else {
      return await generator(task[0]);
    }
  };

  Object.assign(fastify[options.name].services, {
    task: {
      create,
      list,
      detail,
      caseList,
      appendCase,
      removeCase,
      action,
      allocator,
      split,
      copy,
      exportResult
    }
  });
});
