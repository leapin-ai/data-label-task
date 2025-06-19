import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Start = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.task.action, {
            data: {
              id: data.id,
              status: 'inProgress'
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已开始');
        onSuccess && onSuccess();
      }}
      message="确认开始任务吗？开始任务后任务将会发送给指派人，并且完成之前不能继续修改当前任务"
      isDelete={false}
    >
      开始
    </ConfirmButton>
  );
});

export default Start;
