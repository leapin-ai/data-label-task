const TASK_STATUS_ENUM = [
  { value: 'pending', description: '未开始', type: 'text' },
  {
    value: 'inProgress',
    description: '进行中',
    type: 'progress'
  },
  { value: 'completed', description: '已完成', type: 'success' },
  {
    value: 'confirmed',
    description: '管理员确认完成',
    type: 'success'
  },
  { value: 'closed', description: '已关闭', type: 'text' }
];

export default TASK_STATUS_ENUM;
