const fp = require('fastify-plugin');
const ExcelJS = require('exceljs');
const transform = require('lodash/transform');

module.exports = fp(async (fastify, options) => {
  const { models, services } = fastify[options.name];

  const list = async ({ projectId, perPage, currentPage }) => {
    const project = await services.project.detail({ id: projectId });
    const { count, rows } = await models.dataSource.findAndCountAll({
      where: { projectId: project.id },
      offset: perPage * (currentPage - 1),
      limit: perPage,
      order: [['createdAt', 'DESC']]
    });

    return {
      pageData: rows,
      totalCount: count
    };
  };

  const includeData = async ({ projectId, fileIds }) => {
    const project = await services.project.detail({ id: projectId });

    const output = [];

    await Promise.all(
      fileIds.map(async fileId => {
        const { buffer } = await fastify.fileManager.services.getFileBlob({ id: fileId });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        worksheet.eachRow(row => {
          if (row.number === 1) {
            return;
          }
          output.push(
            transform(
              project.fields,
              (result, value, index) => {
                result[value.name] = row.values[index + 1];
              },
              {}
            )
          );
        });
      })
    );

    return await models.dataSource.bulkCreate(
      output.map(data => {
        return { data, projectId };
      })
    );
  };

  const exportData = async () => {};

  const downloadTemplate = async ({ projectId }) => {
    const project = await services.project.detail({ id: projectId });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(project.name);
    // 设置列头和数据
    worksheet.columns = project.fields.map(({ name, label }) => {
      return {
        header: label,
        key: name
      };
    });
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = {
        bold: true
      };

      cell.alignment = {
        vertical: 'middle'
      };
    });

    return {
      buffer: await workbook.xlsx.writeBuffer(),
      filename: `项目数据模版-${project.name}.xlsx`
    };
  };

  Object.assign(fastify[options.name].services, {
    dataSource: {
      list,
      exportData,
      includeData,
      downloadTemplate
    }
  });
});
