import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';

const Edit = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo', 'components-ckeditor:Editor']
})(({ remoteModules, data, onSuccess, ...props }) => {
  const [usePreset, FormInfo, Editor] = remoteModules;
  const { ajax, apis } = usePreset();
  const { useFormModal } = FormInfo;
  const { Input, DatePicker } = FormInfo.fields;
  const formModal = useFormModal();
  const { message } = App.useApp();
  return (
    <Button
      {...props}
      onClick={() => {
        formModal({
          title: '编辑任务',
          formProps: {
            data: Object.assign({}, data),
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.task.save, {
                  data: Object.assign({}, formData, { id: data.id, projectId: data.projectId })
                })
              );
              if (resData.code !== 0) {
                return false;
              }
              message.success('保存成功');
              onSuccess && onSuccess();
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <Input name="name" label="任务名称" rule="REQ LEN-0-100" />,
                <DatePicker name="completeTime" label="截止日期" rule="REQ" format="YYYY-MM-DD" inputReadOnly disabledDate={current => current && current < new Date()} />,
                <Editor name="description" label="任务描述" />
              ]}
            />
          )
        });
      }}
    >
      编辑
    </Button>
  );
});

export default Edit;
