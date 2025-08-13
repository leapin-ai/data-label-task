import { createWithRemoteLoader } from '@kne/remote-loader';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import Fetch from '@kne/react-fetch';
import { Button, Flex, Empty } from 'antd';
import { CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import Lottie from '@components/Lottie';
import localStorage from '@kne/local-storage';
import style from '../style.module.scss';

const CaseDetail = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:InfoPage',
    'components-core:InfoPage@CentralContent',
    'components-core:Enum',
    'components-ckeditor:Editor.Content',
    'components-ckeditor:Editor',
    'components-core:LoadingButton',
    'components-core:FormInfo',
    'components-core:Modal@useModal'
  ]
})(({ remoteModules, id, taskCaseId }) => {
  const [usePreset, InfoPage, CentralContent, Enum, EditorContent, Editor, LoadingButton, FormInfo, useModal] = remoteModules;
  const { ajax, apis } = usePreset();
  const { Form, SubmitButton } = FormInfo;
  const { Input, InputNumber, Switch, TextArea, Select, Upload } = FormInfo.fields;
  const currentTaskCaseIdRef = useRef(taskCaseId);
  const currentRef = useRef();
  const modal = useModal();
  const [expand, setExpand] = useState(localStorage.getItem('expand'));
  const [searchParams, setSearchParams] = useSearchParams();
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
            <Flex vertical justify="center" gap={20}>
              <Flex justify="center">
                <Lottie path="/lottiefiles/Congratulation.json" style={{ width: '500px' }} />
              </Flex>
              <Flex justify="center">任务已完成,请点击确认完成</Flex>
              <Flex justify="center">
                <LoadingButton
                  type="primary"
                  onClick={async () => {
                    const { data: resData } = await ajax(Object.assign({}, apis.client.taskCase.complete, { data: { id: data.task.id } }));
                    if (resData.code !== 0) {
                      return;
                    }
                    refresh();
                  }}
                  size="large"
                >
                  确认完成
                </LoadingButton>
              </Flex>
            </Flex>
          );
        }
        if (!data.taskCase) {
          return (
            <Empty description="没有获取到目标数据">
              <LoadingButton
                type="primary"
                onClick={async () => {
                  setSearchParams(searchParams => {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('taskCaseId');
                    return newSearchParams;
                  });
                }}
              >
                重新获取
              </LoadingButton>
            </Empty>
          );
        }
        currentTaskCaseIdRef.current = data.taskCase.id;
        searchParams.get('taskCaseId') !== data.taskCase?.id &&
          setSearchParams(searchParams => {
            const newSearchParams = new URLSearchParams(searchParams);
            data.taskCase?.id ? newSearchParams.set('taskCaseId', data.taskCase.id) : newSearchParams.delete('taskCaseId');
            return newSearchParams;
          });
        return (
          <div ref={currentRef}>
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
                    } /*{
                      name: 'tracking',
                      title: '任务流转记录',
                      render: () => {
                        return (
                          <Button type="link" className="btn-no-padding">
                            点击查看
                          </Button>
                        );
                      }
                    },*/,
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
                        if (!expand) {
                          return (
                            <Flex vertical gap={5}>
                              <EditorContent>{item}</EditorContent>
                              <Flex justify="center">
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    setExpand(true);
                                    localStorage.setItem('expand', true);
                                  }}
                                >
                                  收起描述
                                </Button>
                              </Flex>
                            </Flex>
                          );
                        }
                        return (
                          <Flex justify="center">
                            <Button
                              type="link"
                              size="small"
                              onClick={() => {
                                setExpand(false);
                                localStorage.setItem('expand', false);
                              }}
                            >
                              显示描述
                            </Button>
                          </Flex>
                        );
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
                    const modalApi = modal({
                      mask: false,
                      closable: false,
                      wrapClassName: style['success-modal'],
                      children: <Lottie path="/lottiefiles/Success.json" />,
                      footer: null,
                      getContainer: () => currentRef.current
                    });
                    setTimeout(() => {
                      modalApi.close();
                    }, 2000);
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
          </div>
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
  const navigate = useNavigate();
  return (
    <Fetch
      {...Object.assign({}, apis.client.taskCase.list, { params: { id } })}
      render={({ data, reload }) => {
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
            pagination={{
              paramsType: 'params',
              onChange: (page, size) => {
                reload({
                  params: {
                    currentPage: page,
                    perPage: size
                  }
                });
              }
            }}
            columns={[
              ...columns,
              {
                name: 'isCompleted',
                title: '是否完成',
                type: 'otherSmall',
                valueOf: item => {
                  return item.isCompleted ? (
                    <Flex style={{ color: 'var(--color-success)' }}>
                      <CheckCircleFilled />
                    </Flex>
                  ) : (
                    <Flex style={{ color: 'var(--font-color-grey-3)' }}>
                      <ClockCircleFilled />
                    </Flex>
                  );
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
              },
              {
                name: 'options',
                title: '操作',
                type: 'options',
                fixed: 'right',
                valueOf: item => {
                  return [
                    {
                      children: '任务详情',
                      onClick: () => {
                        navigate(`/task/${id}?taskCaseId=${item.id}&tab=detail`);
                      }
                    }
                  ];
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
})(({ remoteModules, ...props }) => {
  const [StateBarPage] = remoteModules;
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskCaseId = searchParams.get('taskCaseId');
  const activeKey = searchParams.get('tab') || 'detail';
  return (
    <StateBarPage
      {...props}
      title="任务详情"
      backUrl="/task"
      page={{}}
      stateBar={{
        activeKey,
        onChange: name => {
          setSearchParams(searchParams => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('tab', name);
            return newSearchParams;
          });
        },
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
