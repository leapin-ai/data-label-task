const getColumns = () => {
  return [
    {
      name: 'id',
      title: '编号',
      type: 'serialNumber',
      primary: true,
      hover: true,
      onClick: () => {}
    },
    {
      name: 'name',
      title: '名称',
      type: 'mainInfo'
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
      type: 'description'
    },
    {
      name: 'createdAt',
      title: '添加时间',
      type: 'datetime'
    }
  ];
};

export default getColumns;
