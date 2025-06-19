const getColumns = ({ renderRichText, renderTaskStatus, renderProcess, navigateTo }) => {
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
      name: 'process',
      title: '进度',
      type: 'other',
      valueOf: item => {
        return renderProcess(item.process);
      }
    },
    {
      name: 'completeTime',
      title: '截止日期',
      type: 'date'
    },
    {
      name: 'description',
      title: '描述',
      type: 'description',
      valueOf: item => renderRichText(item.description)
    }
  ];
};

export default getColumns;
