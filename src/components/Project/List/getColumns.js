const getColumns = () => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      primary: false,
      hover: false,
      onClick: () => {}
    },
    {
      name: 'name',
      title: '名称',
      type: 'mainInfo',
      primary: false,
      hover: false,
      ellipsis: true
    },
    {
      name: 'status',
      title: '状态',
      type: 'tag',
      valueOf: item => {
        if (item.status === 'open') {
          return { type: 'success', text: '进行中' };
        }
        return { type: 'text', text: '待开启' };
      }
    },
    {
      name: 'description',
      title: '描述',
      type: 'description',
      ellipsis: true
    },
    {
      name: 'createdAt',
      title: '添加时间',
      type: 'datetime'
    }
  ];
};

export default getColumns;
