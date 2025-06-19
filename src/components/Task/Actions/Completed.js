import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Completed = createWithRemoteLoader({
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
              status: 'completed'
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已完成');
        onSuccess && onSuccess();
      }}
      message="确认完成任务吗？，任务将为完成状态"
      isDelete={false}
    >
      完成
    </ConfirmButton>
  );
});

export default Completed;
