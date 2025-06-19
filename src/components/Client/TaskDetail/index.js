import { createWithRemoteLoader } from '@kne/remote-loader';
import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import Fetch from '@kne/react-fetch';
import { Button, Flex, Empty } from 'antd';

const CaseDetail = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:InfoPage',
    'components-core:InfoPage@CentralContent',
    'components-core:Enum',
    'components-ckeditor:Editor.Content',
    'components-ckeditor:Editor',
    'components-core:LoadingButton',
    'components-core:FormInfo'
  ]
})(({ remoteModules, id, taskCaseId }) => {
  const [usePreset, InfoPage, CentralContent, Enum, EditorContent, Editor, LoadingButton, FormInfo] = remoteModules;
  const { ajax, apis } = usePreset();
  const { Form, SubmitButton } = FormInfo;
  const { Input, InputNumber, Switch, TextArea, Select, Upload } = FormInfo.fields;
  const currentTaskCaseIdRef = useRef(taskCaseId);
  return (
    <Fetch
      {...Object.assign({}, apis.client.taskCase.detail, {
        params: { id, taskCaseId }
      })}
      render={({ data, reload, refresh }) => {
        if (data.task.status !== 'inProgress') {
          return (
            <Empty description="当前任务不在进行中，没有需要完成的任务项">
              <Enum moduleName="taskStatus" name={data.task.status} />
            </Empty>
          );
        }
        if (data.totalCount === data.completeCount) {
          return (
            <Empty description="任务已完成,请点击确认完成">
              <LoadingButton
                type="primary"
                onClick={async () => {
                  const { data: resData } = ajax(Object.assign({}, apis.client.taskCase.complete, { data: { id: data.task.id } }));
                  if (resData.code !== 0) {
                    return;
                  }
                  refresh();
                }}
              >
                确认完成
              </LoadingButton>
            </Empty>
          );
        }
        if (!data.taskCase) {
          return (
            <Empty description="没有获取到目标数据">
              <LoadingButton
                type="primary"
                onClick={async () => {
                  await refresh({ force: true });
                }}
              >
                重新获取
              </LoadingButton>
            </Empty>
          );
        }
        currentTaskCaseIdRef.current = data.taskCase.id;
        return (
          <InfoPage>
            <InfoPage.Part title="任务信息">
              <CentralContent
                dataSource={data.task}
                columns={[
                  { name: 'id', title: '任务ID' },
                  {
                    name: 'taskCaseid',
                    title: '任务项ID',
                    getValueOf: item => {
                      return data.taskCase.id;
                    }
                  },
                  { name: 'name', title: '任务名称' },
                  {
                    name: 'completeTime',
                    title: '截止日期',
                    format: 'date'
                  },
                  {
                    name: 'tracking',
                    title: '任务流转记录',
                    render: () => {
                      return (
                        <Button type="link" className="btn-no-padding">
                          点击查看
                        </Button>
                      );
                    }
                  },
                  {
                    name: 'status',
                    title: '任务状态',
                    render: item => {
                      return <Enum moduleName="taskStatus" name={item} />;
                    }
                  },
                  {
                    name: 'description',
                    title: '任务描述',
                    block: true,
                    render: item => {
                      return <EditorContent>{item}</EditorContent>;
                    }
                  }
                ]}
              />
            </InfoPage.Part>
            <InfoPage.Part title="数据源">
              <CentralContent
                dataSource={data.taskCase.dataSource.data}
                columns={data.task.project.fields
                  .filter(({ needAnnotate }) => !needAnnotate)
                  .map(({ name, label }) => {
                    return {
                      name,
                      title: label
                    };
                  })}
              />
            </InfoPage.Part>
            <InfoPage.Part title="标注项">
              <Form
                key={data.taskCase.id}
                data={data.taskCase.result}
                onSubmit={async formData => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.client.taskCase.submit, {
                      data: Object.assign({}, { id: data.taskCase.id, result: formData })
                    })
                  );
                  if (resData.code !== 0) {
                    return;
                  }
                  await reload({
                    params: {
                      taskCaseId: currentTaskCaseIdRef.current,
                      vector: 'next'
                    }
                  });
                }}
              >
                <FormInfo
                  column={1}
                  list={data.task.project.fields
                    .filter(({ needAnnotate }) => !!needAnnotate)
                    .map(({ name, label, annotateType, annotateRule, annotateEnum }) => {
                      if (annotateType === 'number') {
                        return <InputNumber name={name} label={label} rule={annotateRule} />;
                      }
                      if (annotateType === 'boolean') {
                        return <Switch name={name} label={label} rule={annotateRule} />;
                      }
                      if (annotateType === 'enum') {
                        return <Select name={name} label={label} rule={annotateRule} options={annotateEnum} />;
                      }
                      if (annotateType === 'text') {
                        return <TextArea name={name} label={label} rule={annotateRule} />;
                      }
                      if (annotateType === 'richText') {
                        return <Editor name={name} label={label} rule={annotateRule} />;
                      }
                      if (annotateType === 'file') {
                        return <Upload name={name} label={label} rule={annotateRule} />;
                      }

                      return <Input name={name} label={label} rule={annotateRule} />;
                    })}
                />
                <Flex gap={8} justify="center">
                  <LoadingButton
                    onClick={async () => {
                      await reload({
                        params: {
                          taskCaseId: currentTaskCaseIdRef.current,
                          vector: 'prev'
                        }
                      });
                    }}
                  >
                    上一条
                  </LoadingButton>
                  <SubmitButton>提交</SubmitButton>
                  <LoadingButton
                    onClick={async () => {
                      await reload({
                        params: {
                          taskCaseId: currentTaskCaseIdRef.current,
                          vector: 'next'
                        }
                      });
                    }}
                  >
                    下一条
                  </LoadingButton>
                </Flex>
              </Form>
            </InfoPage.Part>
          </InfoPage>
        );
      }}
    />
  );
});

const CaseList = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table@TablePage']
})(({ remoteModules, id }) => {
  const [usePreset, TablePage] = remoteModules;
  const { apis } = usePreset();
  return (
    <Fetch
      {...Object.assign({}, apis.client.taskCase.list, { params: { id } })}
      render={({ data }) => {
        const columns = data.task.project.fields.map(({ name, label }) => {
          return {
            name: name,
            title: label
          };
        });
        return (
          <TablePage
            {...Object.assign(
              {},
              {
                loader: () => data,
                transformData: data => {
                  return Object.assign({}, data, {
                    pageData: data.pageData.map(item => {
                      return Object.assign(
                        {},
                        item.dataSource.data,
                        {
                          id: item.id,
                          taskCase: item.taskCase,
                          isCompleted: item.isCompleted,
                          startTime: item.startTime,
                          completeTime: item.completeTime
                        },
                        item.result
                      );
                    })
                  });
                }
              }
            )}
            columns={[
              ...columns,
              {
                name: 'isCompleted',
                title: '是否完成',
                type: 'otherSmall',
                valueOf: item => {
                  return item.isCompleted ? '已完成' : '未完成';
                }
              },
              {
                name: 'costTime',
                title: '耗时',
                type: 'otherSmall',
                valueOf: ({ startTime, completeTime }) => {
                  if (!startTime || !completeTime) return;
                  const diff = (new Date(completeTime) - new Date(startTime)) / 1000;
                  return `${diff.toFixed(2)}s`;
                }
              }
            ]}
          />
        );
      }}
    />
  );
});

const TaskDetail = createWithRemoteLoader({
  modules: ['components-core:Layout@StateBarPage']
})(({ remoteModules, menu }) => {
  const [StateBarPage] = remoteModules;
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const taskCaseId = searchParams.get('taskCaseId');
  const [activeKey, setActiveKey] = useState('detail');
  return (
    <StateBarPage
      menu={menu}
      title="任务详情"
      backUrl="/task"
      page={{}}
      stateBar={{
        activeKey,
        onChange: setActiveKey,
        stateOption: [
          { tab: '当前任务项', key: 'detail' },
          { tab: '任务项列表', key: 'list' }
        ]
      }}
    >
      {activeKey === 'detail' && <CaseDetail id={id} taskCaseId={taskCaseId} />}
      {activeKey === 'list' && <CaseList id={id} />}
    </StateBarPage>
  );
});

export default TaskDetail;
