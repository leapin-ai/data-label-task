const getColumns = ({ renderRichText, renderTaskStatus, renderProcess, navigateTo }) => {
  return [
    {
      name: 'id',
      title: 'ID',
      type: 'serialNumber',
      fixed: 'left',
      primary: false,
      hover: false,
      onClick: () => {}
    },
    {
      name: 'name',
      title: '名称',
      type: 'mainInfo',
      primary: false,
      hover: false
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
      valueOf: item => renderRichText(item.description),
      ellipsis: true
    }
  ];
};

export default getColumns;
