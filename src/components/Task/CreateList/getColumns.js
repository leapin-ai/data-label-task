const getColumns = ({ renderRichText, renderTaskStatus, navigateTo }) => {
  return [
    {
      name: 'id',
      title: '编号',
      type: 'serialNumber',
      fixed: 'left',
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
      type: 'other',
      valueOf: item => {
        return renderTaskStatus(item.status);
      }
    },
    {
      name: 'completeTime',
      title: '截止日期',
      type: 'date'
    },
    {
      name: 'allocatorUser',
      title: '指派人',
      valueOf: item => {
        return item.allocatorUser?.nickname || item.allocatorUser?.email;
      }
    },
    {
      name: 'createdUser',
      title: '添加人',
      valueOf: item => {
        return item.createdUser?.nickname || item.createdUser?.email;
      }
    },
    {
      name: 'project',
      title: '所属项目',
      type: 'mainInfo',
      valueOf: item => item.project?.name,
      onClick: ({ colItem }) => {
        colItem.projectId && navigateTo(`/admin/project/${colItem.projectId}`);
      }
    },
    {
      name: 'description',
      title: '描述',
      type: 'description',
      valueOf: item => renderRichText(item.description)
    },
    {
      name: 'createdAt',
      title: '添加时间',
      type: 'datetime'
    }
  ];
};

export default getColumns;
