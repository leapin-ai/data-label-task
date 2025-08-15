import { createWithRemoteLoader } from '@kne/remote-loader';
import { getToken } from '@kne/token-storage';

const ExportResult = createWithRemoteLoader({
  modules: ['components-core:File@Download', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [Download, usePreset] = remoteModules;
  const { apis } = usePreset();
  return (
    <Download {...props} src={`${apis.task.exportResult.url}?token=${getToken('X-User-Token')}&ids=${data.id}`}>
      导出
    </Download>
  );
});

export default ExportResult;
