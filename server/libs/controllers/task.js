const fp = require('fastify-plugin');
const merge = require('lodash/merge');

module.exports = fp(async (fastify, options) => {
  const { services } = fastify[options.name];
  const userAuthenticate = options.getUserAuthenticate(),
    adminAuthenticate = options.getAdminAuthenticate();

  const taskSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      completeTime: { type: 'string', format: 'date-time' },
      allocatorUserId: { type: 'string' },
      projectId: { type: 'string' }
    },
    required: ['name', 'completeTime', 'projectId']
  };

  fastify.post(
    `${options.prefix}/task/create`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '创建任务',
        summary: '创建任务',
        body: taskSchema
      }
    },
    async request => {
      return services.task.create(request.userInfo, request.body);
    }
  );

  fastify.post(
    `${options.prefix}/task/save`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '保存任务',
        summary: '保存任务',
        body: merge({}, taskSchema, {
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        })
      }
    },
    async request => {
      return services.task.save(request.userInfo, request.body);
    }
  );

  fastify.get(
    `${options.prefix}/task/list`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取任务列表',
        summary: '获取任务列表',
        query: {
          type: 'object',
          properties: {
            perPage: {
              type: 'number',
              default: 20
            },
            currentPage: {
              type: 'number',
              default: 1
            },
            projectId: {
              type: 'string'
            },
            taskStatus: {
              type: 'string',
              enum: ['pending', 'inProgress', 'completed', 'confirmed', 'closed']
            }
          }
        }
      }
    },
    async request => {
      return services.task.list(request.query);
    }
  );

  fastify.post(
    `${options.prefix}/task/allocator`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        summary: '任务指派',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            allocatorUserId: { type: 'string' }
          },
          required: ['id', 'allocatorUserId']
        }
      }
    },
    async request => {
      await services.task.allocator(request.userInfo, request.body);
      return {};
    }
  );

  fastify.post(
    `${options.prefix}/task/split`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        summary: '任务拆分',
        body: {
          type: 'object',
          properties: {
            projectId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            completeTime: { type: 'string', format: 'date-time' },
            count: { type: 'number', default: 200 }
          },
          required: ['projectId', 'name', 'completeTime']
        }
      }
    },
    async request => {
      await services.task.split(request.userInfo, request.body);
      return {};
    }
  );

  fastify.post(
    `${options.prefix}/task/copy`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        summary: '任务复制',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        }
      }
    },
    async request => {
      await services.task.copy(request.userInfo, request.body);
      return {};
    }
  );

  fastify.get(
    `${options.prefix}/task/export-result`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        summary: '导出任务结果',
        query: {
          type: 'object',
          properties: {
            ids: {
              type: 'string'
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { file, filename } = await services.task.exportResult(request.userInfo, { ids: request.query.ids.split(',') });
      reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
      reply.type('application/octet-stream');
      reply.send(file);
    }
  );

  fastify.get(
    `${options.prefix}/task/case-list`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取任务项列表',
        summary: '获取任务项列表',
        query: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' },
            perPage: {
              type: 'number',
              default: 20
            },
            currentPage: {
              type: 'number',
              default: 1
            },
            type: {
              type: 'string',
              enum: ['all', 'in', 'notIn'],
              default: 'all'
            }
          },
          required: ['id']
        }
      }
    },
    async request => {
      return services.task.caseList(request.query);
    }
  );

  fastify.get(
    `${options.prefix}/task/detail`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取任务详情',
        summary: '获取任务详情',
        query: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    async request => {
      return services.task.detail(request.query);
    }
  );

  fastify.post(
    `${options.prefix}/task/append-case`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '添加任务项',
        summary: '添加任务项',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' },
            dataSourceIds: { type: 'array', items: { type: 'string' }, description: '数据源id列表' }
          }
        }
      }
    },
    async request => {
      await services.task.appendCase(request.body);
      return {};
    }
  );

  fastify.post(
    `${options.prefix}/task/remove-case`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '删除任务项',
        summary: '删除任务项',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' },
            dataSourceIds: { type: 'array', items: { type: 'string' }, description: '数据源id列表' }
          }
        }
      }
    },
    async request => {
      await services.task.removeCase(request.body);
      return {};
    }
  );

  fastify.post(
    `${options.prefix}/task/action`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '任务操作',
        summary: '任务操作',
        body: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '任务id' },
            status: {
              type: 'string',
              enum: ['pending', 'inProgress', 'completed', 'confirmed', 'closed'],
              description: '任务状态'
            }
          },
          required: ['id', 'status']
        }
      }
    },
    async request => {
      await services.task.action(request.userInfo, request.body);
      return {};
    }
  );

  fastify.post(
    `${options.prefix}/task/remove-batch`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        summary: '批量删除任务',
        body: {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              items: {
                type: 'string'
              },
              minLength: 1
            }
          },
          required: ['ids']
        }
      }
    },
    async request => {
      await services.task.removeBatch(request.userInfo, request.body);
      return {};
    }
  );
});
