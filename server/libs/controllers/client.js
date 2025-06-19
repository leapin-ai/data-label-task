const fp = require('fastify-plugin');

module.exports = fp(async (fastify, options) => {
  const { services } = fastify.project;
  const userAuthenticate = options.getUserAuthenticate();
  fastify.get(
    `${options.prefix}/client/task/list`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端任务列表',
        summary: '客户端任务列表',
        query: {
          type: 'object',
          properties: {
            perPage: { type: 'number', default: 20 },
            currentPage: { type: 'number', default: 1 },
            taskStatus: {
              type: 'string',
              enum: ['pending', 'inProgress', 'completed', 'confirmed', 'closed']
            }
          }
        }
      }
    },
    async request => {
      return services.client.taskList(request.userInfo, request.query);
    }
  );

  fastify.get(
    `${options.prefix}/client/task/detail`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端任务详情',
        summary: '客户端任务详情',
        query: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' }
          },
          required: ['id']
        }
      }
    },
    async request => {
      return services.client.taskDetail(request.userInfo, request.query);
    }
  );

  fastify.get(
    `${options.prefix}/client/task-case/detail`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端任务项详情',
        summary: '客户端任务详情',
        query: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' },
            taskCaseId: { type: 'string', description: '任务项id' },
            vector: { type: 'string', enum: ['next', 'prev', 'current'], default: 'current', description: '方向' }
          },
          required: ['id']
        }
      }
    },
    async request => {
      return services.client.taskCaseDetail(request.userInfo, request.query);
    }
  );

  fastify.get(
    `${options.prefix}/client/task-case/list`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端任务项列表',
        summary: '客户端任务项列表',
        query: {
          type: 'object',
          properties: {
            perPage: { type: 'number', default: 20 },
            currentPage: { type: 'number', default: 1 },
            id: { type: 'string', description: '任务id' }
          },
          required: ['id']
        }
      }
    },
    async request => {
      return services.client.taskCaseList(request.userInfo, request.query);
    }
  );

  fastify.post(
    `${options.prefix}/client/task-case/submit`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端提交任务项',
        summary: '客户端提交任务项',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务项id' },
            result: { type: 'object', description: '标注结果' }
          }
        }
      }
    },
    async request => {
      return services.client.taskCaseSubmit(request.userInfo, request.body);
    }
  );

  fastify.post(
    `${options.prefix}/client/task-case/complete`,
    {
      onRequest: [userAuthenticate],
      schema: {
        description: '客户端完成任务项',
        summary: '客户端完成任务项',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务项id' }
          }
        }
      }
    },
    async request => {
      await services.client.taskCaseComplete(request.userInfo, request.body);
      return {};
    }
  );
});
