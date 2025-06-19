const fp = require('fastify-plugin');
const { NotFound } = require('http-errors');

module.exports = fp(async (fastify, options) => {
  const { models, services } = fastify[options.name];

  const create = async data => {
    return models.project.create(data);
  };

  const update = async ({ id, status, ...data }) => {
    const project = await detail({ id });
    if (status && project.status !== status) {
      project.status = status;
      await project.save();
      return project;
    }
    if (project.status === 'open') {
      throw new Error('Open project cannot be modified');
    }
    return await models.project.update(data, { where: { id } });
  };

  const remove = async ({ id }) => {
    const project = await detail({ id });
    if ((await models.dataSource.count({ where: { projectId: id } })) > 0) {
      throw new Error('Project has data sources');
    }
    if ((await models.task.count({ where: { projectId: id } })) > 0) {
      throw new Error('Project has tasks');
    }

    await project.destroy();
  };

  const list = async ({ perPage, currentPage }) => {
    const { count, rows } = await models.project.findAndCountAll({
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
    const project = await models.project.findByPk(id);
    if (!project) {
      throw new NotFound('Project not found');
    }

    return project;
  };

  Object.assign(fastify[options.name].services, {
    project: {
      create,
      update,
      remove,
      list,
      detail
    }
  });
});
