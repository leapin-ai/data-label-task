module.exports = ({ DataTypes, options }) => {
  return {
    model: {
      name: {
        type: DataTypes.STRING,
        comment: '任务名称'
      },
      completeTime: {
        type: DataTypes.DATE,
        comment: '要求完成时间'
      },
      description: {
        type: DataTypes.TEXT,
        comment: '任务说明和要求'
      },
      status: {
        type: DataTypes.ENUM('pending', 'inProgress', 'completed', 'confirmed', 'closed'),
        comment: '状态: pending:未开始 inProgress:进行中 completed:已完成 confirmed:管理员确认完成 closed:已关闭',
        defaultValue: 'pending'
      },
      tracking: {
        type: DataTypes.JSON,
        comment: '任务状态跟踪信息',
        defaultValue: []
      }
    },
    associate: ({ task, project, taskCase }) => {
      task.belongsTo(options.getUserModel(), {
        foreignKey: 'createdUserId',
        as: 'createdUser',
        comment: '任务创建人',
        allowNull: false
      });
      task.belongsTo(options.getUserModel(), {
        foreignKey: 'allocatorUserId',
        as: 'allocatorUser',
        comment: '任务分配人'
      });
      task.belongsTo(project);
      task.hasMany(taskCase);
    },
    options: {
      comment: '任务'
    }
  };
};
