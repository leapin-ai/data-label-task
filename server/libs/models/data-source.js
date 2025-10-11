module.exports = ({ DataTypes, options }) => {
  return {
    model: {
      data: {
        type: DataTypes.JSON,
        comment: '数据'
      },
      groupName: {
        type: DataTypes.STRING,
        comment: '分组名称'
      },
      groupIndex: {
        type: DataTypes.INTEGER,
        comment: '分组排序'
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
