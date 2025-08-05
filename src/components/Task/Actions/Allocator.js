import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import UserSelect from '@components/UserSelect';

const Allocator = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [useFormModal, usePreset] = remoteModules;
  const formModal = useFormModal();
  const { apis, ajax } = usePreset();
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: '任务指派',
          size: 'small',
          formProps: {
            data: Object.assign(
              {},
              {
                allocatorUserId: data.allocatorUser && {
                  value: data.allocatorUser.id,
                  label: data.allocatorUser.nickname || data.allocatorUser.email || data.allocatorUser.phone
                }
              }
            ),
            onSubmit: async ({ allocatorUserId }) => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.task.allocator, {
                  data: {
                    allocatorUserId,
                    id: data.id
                  }
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('指派成功');
              onSuccess && onSuccess();
            }
          },
          children: <UserSelect name="allocatorUserId" label="指派人" rule="REQ" single interceptor="object-output-value" />
        });
      }}
    >
      指派
    </Button>
  );
});

export default Allocator;
