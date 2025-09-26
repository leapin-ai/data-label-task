const fp = require('fastify-plugin');
const merge = require('lodash/merge');

module.exports = fp(async (fastify, options) => {
  const { services } = fastify[options.name];
  const userAuthenticate = options.getUserAuthenticate(),
    adminAuthenticate = options.getAdminAuthenticate();

  const projectSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      fields: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            label: { type: 'string' },
            needAnnotate: { type: 'boolean', default: false },
            needSearch: { type: 'boolean', default: false },
            annotateType: {
              type: 'string',
              enum: ['string', 'text', 'richText', 'boolean', 'number', 'file', 'enum', 'hidden', 'compare']
            },
            annotateEnum: {
              type: 'array',
              items: {
                type: 'object',
                properties: { label: { type: 'string' }, value: { type: 'string' } }
              }
            }
          },
          required: ['name', 'label']
        }
      },
      status: {
        type: 'string',
        default: 'close'
      }
    }
  };

  fastify.post(
    `${options.prefix}/project/create`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '创建项目',
        summary: '创建项目',
        body: merge({}, projectSchema, {
          required: ['name', 'fields']
        })
      }
    },
    async request => {
      return services.project.create(request.body);
    }
  );

  fastify.post(
    `${options.prefix}/project/update`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '修改项目',
        summary: '修改项目',
        body: merge({}, projectSchema, {
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        })
      }
    },
    async request => {
      return services.project.update(request.body);
    }
  );

  fastify.get(
    `${options.prefix}/project/list`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取项目列表',
        summary: '获取项目列表',
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
            }
          }
        }
      }
    },
    async request => {
      return services.project.list(request.query);
    }
  );

  fastify.get(
    `${options.prefix}/project/detail`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取项目详情',
        summary: '获取项目详情',
        query: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    async request => {
      return services.project.detail(request.query);
    }
  );

  fastify.post(
    `${options.prefix}/project/remove`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '删除项目',
        summary: '删除项目',
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
      await services.project.remove(request.body);
      return {};
    }
  );
});
