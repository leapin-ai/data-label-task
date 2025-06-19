import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Reset = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [LoadingButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <LoadingButton
      {...props}
      onClick={async () => {
        const { data: resData } = await ajax(
          Object.assign({}, apis.task.action, {
            data: {
              id: data.id,
              status: 'pending'
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已重新打开');
        onSuccess && onSuccess();
      }}
    >
      重新打开
    </LoadingButton>
  );
});

export default Reset;
