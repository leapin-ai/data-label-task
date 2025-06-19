import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Confirmed = createWithRemoteLoader({
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
              status: 'confirmed'
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已确认完成');
        onSuccess && onSuccess();
      }}
      message="确认任务完成吗？确认后，任务将为确认完成状态"
      isDelete={false}
    >
      确认完成
    </ConfirmButton>
  );
});

export default Confirmed;
