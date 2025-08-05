import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';

const Copy = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message="确定要复制任务吗？"
      isDelete={false}
      onClick={async () => {
        const { data: resData } = await ajax(Object.assign({}, apis.task.copy, { data: { id: data.id } }));
        if (resData.code !== 0) {
          return;
        }
        message.success('复制成功');
        onSuccess && onSuccess();
      }}
    >
      复制
    </ConfirmButton>
  );
});

export default Copy;
