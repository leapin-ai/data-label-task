const fp = require('fastify-plugin');
const { NotFound, Forbidden } = require('http-errors');

module.exports = fp(async (fastify, options) => {
  const { models, services } = fastify[options.name];
  const { Op } = fastify.sequelize.Sequelize;
  const sequelize = fastify.sequelize.instance;
  const taskList = async (authenticatePayload, { perPage, currentPage, taskStatus }) => {
    const { id: userId } = authenticatePayload;
    const whereQuery = {};
    if (taskStatus) {
      whereQuery.status = taskStatus;
    }
    const { rows, count } = await models.task.findAndCountAll({
      attributes: ['id', 'name', 'completeTime', 'description', 'status', 'tracking'],
      include: {
        model: models.project,
        where: {
          status: 'open'
        }
      },
      where: {
        ...whereQuery,
        allocatorUserId: userId
      },
      offset: perPage * (currentPage - 1),
      limit: perPage,
      order: [['createdAt', 'DESC']]
    });

    const taskCases = await models.taskCase.findAll({
      attributes: ['taskId', [sequelize.fn('COUNT', 'is_completed'), 'totalCount'], [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_completed = true THEN 1 ELSE 0 END')), 'completeCount']],
      where: {
        taskId: { [Op.in]: rows.map(item => item.id) }
      },
      group: ['taskId']
    });

    return {
      pageData: rows.map(task => {
        const taskCase = taskCases.find(tc => tc.taskId === task.id);
        return Object.assign({}, task.get({ plain: true }), {
          process: {
            total: taskCase ? taskCase.get('totalCount') : 0,
            complete: taskCase ? taskCase.get('completeCount') : 0
          }
        });
      }),
      totalCount: count
    };
  };

  const taskDetail = async (authenticatePayload, { id }) => {
    const { id: userId } = authenticatePayload;
    const task = await models.task.findOne({
      include: models.project,
      where: {
        id,
        allocatorUserId: userId
      }
    });

    if (!task) {
      throw new NotFound('Task not found');
    }

    if (task.project.status !== 'open') {
      throw new NotFound('Project already closed');
    }

    return task;
  };

  const taskCaseDetail = async (authenticatePayload, { id, taskCaseId, vector }) => {
    const task = await taskDetail(authenticatePayload, { id });
    const taskCase = await (() => {
      if (taskCaseId && vector === 'next') {
        return models.taskCase.findOne({
          include: models.dataSource,
          where: {
            id: {
              [Op.gt]: taskCaseId
            },
            taskId: task.id,
            isCompleted: false
          },
          order: [['id', 'ASC']]
        });
      }
      if (taskCaseId && vector === 'prev') {
        return models.taskCase.findOne({
          include: models.dataSource,
          where: {
            id: {
              [Op.lt]: taskCaseId
            },
            taskId: task.id,
            isCompleted: false
          }
        });
      }

      if (taskCaseId) {
        return models.taskCase.findOne({
          include: models.dataSource,
          where: {
            id: taskCaseId
          }
        });
      }

      return models.taskCase.findOne({
        include: models.dataSource,
        where: {
          isCompleted: false,
          taskId: task.id
        }
      });
    })();

    const taskCaseCounts = await models.taskCase.findAll({
      attributes: ['isCompleted', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: {
        taskId: task.id
      },
      group: ['isCompleted']
    });

    const totalCount = await models.taskCase.count({
      where: {
        taskId: task.id
      }
    });

    const completeCount = await models.taskCase.count({
      where: {
        taskId: task.id,
        isCompleted: true
      }
    });

    taskCase && !taskCase.isCompleted && (await taskCase.update({ startTime: new Date() }));

    return {
      task,
      taskCase,
      totalCount,
      completeCount
    };
  };

  const taskCaseList = async (authenticatePayload, { id, perPage, currentPage, isCompleted }) => {
    const task = await taskDetail(authenticatePayload, { id });
    const queryWhere = {};
    if (typeof isCompleted === 'boolean') {
      queryWhere.isCompleted = isCompleted;
    }
    const { rows, count } = await models.taskCase.findAndCountAll({
      include: models.dataSource,
      where: Object.assign({}, queryWhere, {
        taskId: task.id
      }),
      offset: perPage * (currentPage - 1),
      limit: perPage,
      order: [['id', 'ASC']]
    });

    return {
      task,
      pageData: rows,
      totalCount: count
    };
  };

  const taskCaseSubmit = async (authenticatePayload, { id, result }) => {
    const taskCase = await taskCaseInstance(authenticatePayload, { id });

    await taskCase.update({ isCompleted: true, completeTime: new Date(), result });

    return taskCase;
  };

  const taskCaseInstance = async (authenticatePayload, { id }) => {
    const taskCase = await models.taskCase.findByPk(id, {
      include: models.task
    });
    if (!taskCase) {
      throw new NotFound('Task case not found');
    }

    if (taskCase.task.allocatorUserId !== authenticatePayload.id) {
      throw new Forbidden('You are not the allocator of this task');
    }

    return taskCase;
  };

  const taskCaseComplete = async (authenticatePayload, { id }) => {
    const task = await taskDetail(authenticatePayload, { id });

    if (
      (await models.taskCase.count({
        where: {
          taskId: task.id,
          isCompleted: false
        }
      })) > 0
    ) {
      throw new Error('There are still uncompleted task cases');
    }
    await task.update({
      status: 'completed',
      tracking: [
        ...task.tracking,
        {
          currentStatus: task.status,
          nextStatus: 'completed',
          time: new Date(),
          operator: {
            id: authenticatePayload.id,
            name: authenticatePayload.nickname || authenticatePayload.email || authenticatePayload.phone,
            avatar: authenticatePayload.avatar,
            type: 'client'
          }
        }
      ]
    });
  };

  Object.assign(fastify[options.name].services, {
    client: {
      taskList,
      taskDetail,
      taskCaseDetail,
      taskCaseList,
      taskCaseSubmit,
      taskCaseComplete
    }
  });
});
