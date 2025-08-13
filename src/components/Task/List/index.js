import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { Space } from 'antd';
import CreateList from '../CreateList';

const List = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset', 'components-core:StateBar', 'components-core:Enum']
})(({ remoteModules }) => {
  const [TablePage, Filter, usePreset, StateBar, Enum] = remoteModules;
  const { apis } = usePreset();
  const { SearchInput, getFilterValue } = Filter;
  const ref = useRef(null);
  const [filter, setFilter] = useState([]);
  const filterValue = getFilterValue(filter);

  return (
    <Enum moduleName="taskStatus">
      {taskStatus => {
        const taskStatusList = [{ value: 'all', description: '全部' }, ...taskStatus];
        const stateTypeMap = new Map(taskStatusList.map(item => [item.value, item]));
        return (
          <CreateList
            onSuccess={() => {
              ref.current.reload();
            }}
          >
            {props => {
              return (
                <TablePage
                  {...Object.assign({}, apis.task.list, {
                    params: Object.assign({}, filterValue)
                  })}
                  {...props}
                  ref={ref}
                  name="task-list"
                  pagination={{ paramsType: 'params' }}
                  topArea={
                    <StateBar
                      type="step"
                      size="small"
                      activeKey={filterValue.taskStatus || 'all'}
                      onChange={value => {
                        const currentState = stateTypeMap.get(value);
                        setFilter(filter => {
                          const newFilter = filter.slice(0);
                          const currentIndex = filter.findIndex(item => item.name === 'taskStatus');
                          if (currentIndex === -1) {
                            newFilter.push({
                              name: 'taskStatus',
                              value: { label: currentState.description, value: currentState.value }
                            });
                          } else {
                            if (currentState.value === 'all') {
                              newFilter.splice(currentIndex, 1);
                            } else {
                              newFilter.splice(currentIndex, 1, {
                                name: 'taskStatus',
                                value: { label: currentState.description, value: currentState.value }
                              });
                            }
                          }
                          return newFilter;
                        });
                      }}
                      stateOption={taskStatusList.map(({ value, description }) => ({
                        key: value,
                        tab: description
                      }))}
                    />
                  }
                  page={{
                    filter: {
                      value: filter,
                      onChange: setFilter
                    },
                    titleExtra: (
                      <Space align="center">
                        <SearchInput name="name" label="名称" />
                      </Space>
                    )
                  }}
                />
              );
            }}
          </CreateList>
        );
      }}
    </Enum>
  );
});

export default List;
