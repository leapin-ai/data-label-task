import { createWithRemoteLoader } from '@kne/remote-loader';
import { Alert, Flex } from 'antd';
import { useRef, useState } from 'react';
import uniq from 'lodash/uniq';
import style from './style.module.scss';

const List = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table@TablePage', 'components-core:Icon', 'components-core:ConfirmButton', 'components-core:StateBar']
})(({ remoteModules, data }) => {
  const [usePreset, TablePage, Icon, ConfirmButton, StateBar] = remoteModules;
  const { apis, ajax } = usePreset();
  const ref = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeKey, setActiveKey] = useState(data.status !== 'pending' ? 'in' : 'all');
  const columns = data.project.fields.map(({ name, label, needAnnotate, annotateType }) => {
    return {
      name: name,
      title: label,
      ellipsis: true,
      valueOf: item => {
        return needAnnotate ? item.taskCase?.result?.[name] : item[name];
      }
    };
  });
  if (data.status === 'pending') {
    columns.splice(0, 0, {
      name: 'isTask',
      title: '是否已加入任务',
      fixed: 'left',
      valueOf: item => {
        return item.taskCase && <Icon type="gouxuan" className={style['task-icon']} />;
      }
    });
  }
  if (['pending', 'closed'].indexOf(data.status) === -1) {
    columns.push(
      {
        name: 'isCompleted',
        title: '是否完成标注',
        type: 'tag',
        valueOf: item => {
          return item.taskCase?.isCompleted
            ? {
                type: 'success',
                text: '已完成'
              }
            : {
                type: 'progress',
                text: '未完成'
              };
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
              children: '评论'
            }
          ];
        }
      }
    );
  }
  return (
    <Flex vertical gap={8}>
      {data.status === 'pending' && <Alert message="任务未开始，您可以设置任务项，完成设置后将开始任务状态，之后将不允许进行任务项调整" type="info" showIcon />}
      {data.status !== 'pending' && <Alert message="只有任务未开始状态可以修改任务项，当前任务为只读状态不能进行修改" type="warning" showIcon />}
      {data.status === 'pending' && (
        <Flex justify="space-between">
          <div>
            <StateBar
              size="small"
              type="radio"
              activeKey={activeKey}
              onChange={setActiveKey}
              stateOption={[
                { tab: '全部', key: 'all' },
                { tab: '已加入', key: 'in' },
                {
                  tab: '未加入',
                  key: 'notIn'
                }
              ]}
            />
          </div>
          {selectedRowKeys.length > 0 && (
            <Flex gap={8}>
              <div>已选择: {selectedRowKeys.length}条数据源</div>
              <ConfirmButton
                onClick={async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.task.appendCase, {
                      data: {
                        id: data.id,
                        dataSourceIds: selectedRowKeys
                      }
                    })
                  );
                  if (resData.code !== 0) {
                    return;
                  }
                  ref.current.reload();
                  setSelectedRowKeys([]);
                }}
                size="small"
                isDelete={false}
                type="primary"
                message={`确定要将当前选择的${selectedRowKeys.length}条数据源添加到任务项吗？`}
              >
                添加到任务项
              </ConfirmButton>
              <ConfirmButton
                onClick={async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.task.removeCase, {
                      data: {
                        id: data.id,
                        dataSourceIds: selectedRowKeys
                      }
                    })
                  );
                  if (resData.code !== 0) {
                    return;
                  }
                  ref.current.reload();
                  setSelectedRowKeys([]);
                }}
                size="small"
                message={`确定要将当前选择的${selectedRowKeys.length}条任务项删除吗？`}
              >
                删除任务项
              </ConfirmButton>
            </Flex>
          )}
        </Flex>
      )}
      <TablePage
        {...Object.assign({}, apis.task.caseList, {
          params: { id: data.id, type: activeKey },
          transformData: data => {
            return Object.assign({}, data, {
              pageData: data.pageData.map(item => {
                return Object.assign({}, item.data, { id: item.id, taskCase: item.taskCase });
              })
            });
          }
        })}
        name="task-case-list"
        pagination={{ paramsType: 'params' }}
        ref={ref}
        rowSelection={
          data.status === 'pending'
            ? {
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
              }
            : false
        }
        columns={[
          {
            name: 'id',
            title: 'ID',
            type: 'serialNumber',
            primary: false,
            hover: false
          },
          ...columns
        ]}
      />
    </Flex>
  );
});

export default List;
