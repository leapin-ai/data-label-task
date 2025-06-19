import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button } from 'antd';
import UserSelect from '@components/UserSelect';
import { useRef } from 'react';
import getColumns from './getColumns';
import { CreateList } from '@components/Task';

const Task = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table@TablePage', 'components-core:FormInfo', 'components-ckeditor:Editor', 'components-core:Enum', 'components-core:StateTag']
})(({ remoteModules, data }) => {
  const [usePreset, TablePage, FormInfo, Editor, Enum, StateTag] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const ref = useRef();
  const { Input, DatePicker } = FormInfo.fields;
  return (
    <Flex vertical gap={8} flex={1}>
      <Flex justify="space-between">
        <div></div>
        <Flex gap={8}>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              const formModalApi = formModal({
                title: '添加任务',
                formProps: {
                  onSubmit: async formData => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.task.create, {
                        data: Object.assign({}, formData, { projectId: data.id })
                      })
                    );

                    if (resData.code !== 0) {
                      return;
                    }
                    formModalApi.close();
                    ref.current.reload();
                  }
                },
                children: (
                  <FormInfo
                    column={1}
                    list={[
                      <Input name="name" label="任务名称" rule="REQ LEN-0-100" />,
                      <UserSelect name="allocatorUserId" label="指派人" rule="REQ" single interceptor="object-output-value" />,
                      <DatePicker name="completeTime" label="截止日期" rule="REQ" format="YYYY-MM-DD" inputReadOnly disabledDate={current => current && current < new Date()} />,
                      <Editor name="description" label="任务描述" />
                    ]}
                  />
                )
              });
            }}
          >
            添加任务
          </Button>
        </Flex>
      </Flex>
      <CreateList
        onSuccess={() => {
          ref.current.reload();
        }}
      >
        {props => {
          return (
            <TablePage
              {...Object.assign({}, apis.task.list, {
                params: { projectId: data.id }
              })}
              {...props}
              name="project-task-list"
              pagination={{ paramsType: 'params' }}
              ref={ref}
            />
          );
        }}
      </CreateList>
    </Flex>
  );
});

export default Task;
