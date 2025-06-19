const fp = require('fastify-plugin');

module.exports = fp(async (fastify, options) => {
  const { services } = fastify[options.name];
  const userAuthenticate = options.getUserAuthenticate(),
    adminAuthenticate = options.getAdminAuthenticate();
  fastify.get(
    `${options.prefix}/data-source/download-template`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '下载项目数据模版',
        summary: '下载项目数据模版',
        query: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: '项目ID' }
          },
          required: ['projectId']
        }
      }
    },
    async (request, reply) => {
      const { buffer, filename } = await services.dataSource.downloadTemplate(request.query);
      reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="${encodeURIComponent(`${filename}`)}"`)
        .send(buffer);
    }
  );

  fastify.get(
    `${options.prefix}/data-source/list`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '获取数据源列表',
        summary: '获取数据源列表',
        query: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: '项目ID' },
            perPage: { type: 'number', default: 20 },
            currentPage: { type: 'number', default: 1 }
          }
        }
      }
    },
    async request => {
      return services.dataSource.list(request.query);
    }
  );

  fastify.post(
    `${options.prefix}/data-source/include`,
    {
      onRequest: [userAuthenticate, adminAuthenticate],
      schema: {
        description: '导入数据源',
        summary: '导入数据源',
        body: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: '项目ID' },
            fileIds: { type: 'array', items: { type: 'string' }, description: '文件ID列表' }
          }
        }
      }
    },
    async request => {
      return services.dataSource.includeData(request.body);
    }
  );
});
