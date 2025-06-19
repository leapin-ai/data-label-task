import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Closed = createWithRemoteLoader({
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
              status: 'closed'
            }
          })
        );
        if (resData.code !== 0) {
          return;
        }
        message.success('任务已关闭');
        onSuccess && onSuccess();
      }}
      message="确认关闭任务吗？"
      isDelete={false}
    >
      关闭
    </ConfirmButton>
  );
});

export default Closed;
