import { createWithRemoteLoader } from '@kne/remote-loader';
import { Progress } from 'antd';
import getColumns from './getColumns';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './style.module.scss';

const Task = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset', 'components-core:Enum', 'components-core:StateTag', 'components-core:StateBar']
})(({ remoteModules, menu }) => {
  const [TablePage, usePreset, Enum, StateTag, StateBar] = remoteModules;
  const { apis } = usePreset();
  const ref = useRef();
  const [activeKey, setActiveKey] = useState('inProgress');
  const navigate = useNavigate();
  return (
    <TablePage
      {...Object.assign({}, apis.client.task.list, {
        params: Object.assign({}, activeKey !== 'all' && { taskStatus: activeKey })
      })}
      pagination={{ paramsType: 'params' }}
      columns={[
        ...getColumns({
          renderRichText: item => {
            const dom = document.createElement('div');
            dom.innerHTML = item;
            return dom.innerText;
          },
          renderTaskStatus: item => {
            return (
              <Enum moduleName="taskStatus" name={item}>
                {({ type, description }) => {
                  return <StateTag type={type} text={description} />;
                }}
              </Enum>
            );
          },
          renderProcess: item => {
            return item && <Progress percent={(item.complete / item.total) * 100} />;
          }
        }),
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
                  navigate(`/task/${item.id}`);
                }
              }
            ];
          }
        }
      ]}
      ref={ref}
      name="client-task"
      page={{
        menu,
        title: (
          <Enum moduleName="taskStatus">
            {list => {
              list.unshift({
                value: 'all',
                description: '全部'
              });
              return (
                <StateBar
                  className={style['header-bar']}
                  type="step"
                  size="small"
                  activeKey={activeKey}
                  onChange={setActiveKey}
                  stateOption={list
                    .filter(({ value }) => value !== 'pending')
                    .map(({ value, description }) => ({
                      key: value,
                      tab: description
                    }))}
                />
              );
            }}
          </Enum>
        )
      }}
    />
  );
});

export default Task;
