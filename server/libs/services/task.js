const fp = require('fastify-plugin');
const { NotFound } = require('http-errors');

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
      pending: ['inProgress'],
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

  Object.assign(fastify[options.name].services, {
    task: {
      create,
      list,
      detail,
      caseList,
      appendCase,
      removeCase,
      action
    }
  });
});
