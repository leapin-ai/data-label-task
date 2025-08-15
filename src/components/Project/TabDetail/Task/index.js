import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, Alert, Dropdown, App } from 'antd';
import UserSelect from '@components/UserSelect';
import { useRef, useState } from 'react';
import qs from 'qs';
import { CreateList } from '@components/Task';
import uniq from 'lodash/uniq';
import { getToken } from '@kne/token-storage';
import style from '../style.module.scss';

const Task = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table@TablePage', 'components-core:FormInfo', 'components-ckeditor:Editor', 'components-core:File@Download', 'components-core:ConfirmButton']
})(({ remoteModules, data }) => {
  const [usePreset, TablePage, FormInfo, Editor, Download, ConfirmButton] = remoteModules;
  const { apis, ajax } = usePreset();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { useFormModal } = FormInfo;
  const { message } = App.useApp();
  const formModal = useFormModal();
  const ref = useRef();
  const { Input, DatePicker, InputNumber } = FormInfo.fields;
  return (
    <Flex vertical gap={8} flex={1}>
      <Flex justify="space-between">
        {selectedRowKeys.length > 0 ? <div>已选择: {selectedRowKeys.length}条数据源</div> : <div>&nbsp;</div>}
        <Flex gap={8}>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              formModal({
                title: '添加任务',
                formProps: {
                  onSubmit: async formData => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.task.create, {
                        data: Object.assign({}, formData, { projectId: data.id })
                      })
                    );

                    if (resData.code !== 0) {
                      return false;
                    }
                    ref.current.reload();
                  }
                },
                children: (
                  <FormInfo
                    column={1}
                    list={[
                      <Input name="name" label="任务名称" rule="REQ LEN-0-100" />,
                      <UserSelect name="allocatorUserId" label="指派人" single interceptor="object-output-value" />,
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
          <Dropdown
            rootClassName={style['menu-list']}
            menu={{
              items: [
                {
                  key: 'task',
                  label: (
                    <Button
                      className="button-group-item"
                      onClick={() => {
                        formModal({
                          title: '批量生成任务',
                          formProps: {
                            onSubmit: async formData => {
                              const { data: resData } = await ajax(
                                Object.assign({}, apis.task.split, {
                                  data: Object.assign({}, formData, { projectId: data.id })
                                })
                              );
                              if (resData.code !== 0) {
                                return false;
                              }
                              message.success('批量生成任务成功');
                              ref.current.reload();
                            }
                          },
                          saveText: '执行',
                          children: (
                            <Flex vertical gap={10}>
                              <Alert type="info" message="按照分配数据源数量将未分配的数据源批量分配到多个任务" />
                              <FormInfo
                                column={1}
                                list={[
                                  <Input name="name" label="任务名称" rule="REQ LEN-0-100" />,
                                  <InputNumber name="count" label="分配数据源数量" rule="REQ" defaultValue={200} />,
                                  <DatePicker name="completeTime" label="截止日期" rule="REQ" format="YYYY-MM-DD" inputReadOnly disabledDate={current => current && current < new Date()} />,
                                  <Editor name="description" label="任务描述" />
                                ]}
                              />
                            </Flex>
                          )
                        });
                      }}
                    >
                      批量生成任务
                    </Button>
                  )
                },
                {
                  key: 'remove',
                  label: (
                    <ConfirmButton
                      size="small"
                      className="button-group-item"
                      onClick={async () => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.task.removeBatch, {
                            data: { ids: selectedRowKeys }
                          })
                        );
                        if (resData.code !== 0) {
                          return;
                        }
                        message.success('删除成功');
                        ref.current.reload();
                      }}
                    >
                      删除
                    </ConfirmButton>
                  )
                }
              ]
            }}
          >
            <Button size="small">批量操作</Button>
          </Dropdown>

          <Download disabled={selectedRowKeys.length === 0} size="small" src={`${apis.task.exportResult.url}?token=${getToken('X-User-Token')}&${qs.stringify({ ids: selectedRowKeys.join(',') })}`}>
            导出
          </Download>
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
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onSelectAll: (type, selected, items) => {
                  const ids = items.map(({ id }) => id);
                  if (type) {
                    setSelectedRowKeys(value => {
                      return uniq([...value, ...ids]);
                    });
                  } else {
                    setSelectedRowKeys(value => {
                      return value.filter(item => {
                        return ids.indexOf(item) === -1;
                      });
                    });
                  }
                },
                onSelect: (item, type) => {
                  if (type) {
                    setSelectedRowKeys(value => {
                      const newValue = value.slice(0);
                      newValue.push(item.id);
                      return newValue;
                    });
                  } else {
                    setSelectedRowKeys(value => {
                      const newValue = value.slice(0);
                      newValue.splice(newValue.indexOf(item.id), 1);
                      return newValue;
                    });
                  }
                }
              }}
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
