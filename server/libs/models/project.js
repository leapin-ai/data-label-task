module.exports = ({ DataTypes, options }) => {
  return {
    model: {
      name: {
        type: DataTypes.STRING,
        comment: '名称',
        unique: true,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        comment: '描述'
      },
      fields: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: '字段'
      },
      status: {
        type: DataTypes.ENUM,
        values: ['open', 'close'],
        defaultValue: 'open',
        comment: '状态'
      },
      options: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: '扩展字段'
      }
    },
    options: {
      comment: '项目'
    }
  };
};
