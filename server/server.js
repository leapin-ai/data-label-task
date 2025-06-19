const fastify = require('fastify')({
  logger: true,
  querystringParser: str => require('qs').parse(str)
});

const fastifyEnv = require('@fastify/env');
const packageJson = require('./package.json');
const path = require('node:path');

const version = `v${packageJson.version.split('.')[0]}`;

const options = {
  name: 'project',
  prefix: `/api/${version}`,
  getUserAuthenticate: () => {
    return fastify.account.authenticate.user;
  },
  getAdminAuthenticate: () => {
    return fastify.account.authenticate.admin;
  },
  getUserModel: () => {
    return fastify.account.models.user;
  }
};

const createServer = () => {
  fastify.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: 'object',
      properties: {
        DB_DIALECT: { type: 'string', default: 'sqlite' },
        DB_HOST: { type: 'string', default: 'data.db' },
        DB_USERNAME: { type: 'string' },
        DB_PASSWORD: { type: 'string' },
        DB_DATABASE: { type: 'string' },
        ENV: { type: 'string', default: 'local' },
        PORT: { type: 'number', default: 8040 },

        OSS_REGION: { type: 'string' },
        OSS_BUCKET: { type: 'string' },
        OSS_ACCESS_KEY_ID: { type: 'string' },
        OSS_ACCESS_KEY_SECRET: { type: 'string' },

        ALISMTP_USER: { type: 'string' },
        ALISMTP_PASSWORD: { type: 'string' },
        ALISMTP_ENDPOINT: { type: 'string' },
        LANDSCAPE: { type: 'string', default: 'ap' },
        IS_TEST: { type: 'boolean', default: false }
      }
    }
  });

  fastify.register(
    require('fastify-plugin')(async fastify => {
      fastify.register(require('@kne/fastify-sequelize'), {
        db: {
          dialect: fastify.config.DB_DIALECT,
          host: fastify.config.DB_HOST,
          database: fastify.config.DB_DATABASE,
          username: fastify.config.DB_USERNAME,
          password: fastify.config.DB_PASSWORD
        },
        modelsGlobOptions: {
          syncOptions: {}
        }
      });
    })
  );

  fastify.register(require('@kne/fastify-file-manager'), {
    prefix: `${options.prefix}/static`,
    root: path.resolve('./static'),
    ossAdapter: () => {
      return fastify.aliyun.services.oss;
    }
  });

  fastify.register(require('@kne/fastify-account'), {
    isTest: true,
    prefix: `${options.prefix}`
  });

  fastify.register(
    require('fastify-plugin')(async fastify => {
      fastify.register(require('@kne/fastify-namespace'), {
        options,
        name: options.name,
        modules: [
          ['controllers', path.resolve(__dirname, './libs/controllers')],
          [
            'models',
            await fastify.sequelize.addModels(path.resolve(__dirname, './libs/models'), {
              getUserModel: options.getUserModel
            })
          ],
          ['services', path.resolve(__dirname, './libs/services')]
        ]
      });
      await fastify.sequelize.sync();
    })
  );

  fastify.register(
    require('fastify-plugin')(async fastify => {
      fastify.register(require('@kne/fastify-aliyun'), {
        prefix: `${options.prefix}/aliyun`,
        oss: {
          baseDir: 'video-conference',
          region: fastify.config.OSS_REGION,
          accessKeyId: fastify.config.OSS_ACCESS_KEY_ID,
          accessKeySecret: fastify.config.OSS_ACCESS_KEY_SECRET,
          bucket: fastify.config.OSS_BUCKET
        }
      });
      const getEntry = () => {
        const env = fastify.config.ENV;
        if (env === 'staging') {
          return 'entry.html';
        }

        if (env === 'prod') {
          return 'entry-prod.html';
        }

        return 'index.html';
      };
      fastify.register(require('@fastify/static'), {
        root: path.join(__dirname, './build'), // 静态文件目录
        prefix: '/',
        decorateReply: false,
        index: getEntry()
      });
      fastify.setNotFoundHandler((req, reply) => {
        if (req.method === 'GET') {
          reply.sendFile(getEntry(), { root: path.join(__dirname, './build') });
        }
        reply.code(404).send({ error: 'Not Found' });
      });
    })
  );

  fastify.register(require('@kne/fastify-response-data-format'));
};

module.exports = {
  fastify,
  createServer,
  start: () => {
    createServer();
    return fastify.then(() => {
      fastify.listen({ port: fastify.config.PORT, host: '0.0.0.0' }, (err, address) => {
        if (err) throw err;
        console.log(`Server is now listening on ${address}`);
      });
    });
  }
};
