module.exports = ({ DataTypes, options }) => {
  return {
    model: {
      data: {
        type: DataTypes.JSON,
        comment: '数据'
      }
    },
    associate: ({ project, dataSource }) => {
      dataSource.belongsTo(project);
    },
    options: {
      comment: '数据源'
    }
  };
};
