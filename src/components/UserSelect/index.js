import { createWithRemoteLoader } from '@kne/remote-loader';

const UserSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [usePreset, FormInfo] = remoteModules;
  const { apis } = usePreset();
  const { SuperSelectUser } = FormInfo.fields;
  return (
    <SuperSelectUser
      {...props}
      api={Object.assign({}, apis.admin.getUserList, {
        transformData: data => {
          return Object.assign({}, data, {
            pageData: (data.pageData || []).map(item =>
              Object.assign({}, item, {
                label: item.nickname || item.email || item.phone
              })
            )
          });
        }
      })}
    />
  );
});

export default UserSelect;
