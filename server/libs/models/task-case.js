module.exports = ({ DataTypes, options }) => {
  return {
    model: {
      result: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: '标注结果'
      },
      startTime: {
        type: DataTypes.DATE,
        comment: '开始时间'
      },
      completeTime: {
        type: DataTypes.DATE,
        comment: '完成时间'
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否完成'
      },
      comment: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: '标注结果评论'
      }
    },
    associate: ({ dataSource, task, taskCase }) => {
      taskCase.belongsTo(task);
      taskCase.belongsTo(dataSource);
      taskCase.belongsTo(options.getUserModel(), {
        foreignKey: 'allocatorUserId',
        comment: '任务分配人'
      });
    },
    options: {
      comment: '任务项'
    }
  };
};
