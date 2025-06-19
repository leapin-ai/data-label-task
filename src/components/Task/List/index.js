import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef, useState } from 'react';
import { Space, Button, App } from 'antd';
import FormInner from '../FormInner';
import CreateList from '../CreateList';

const List = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset', 'components-core:FormInfo@useFormModal', 'components-core:StateBar', 'components-core:Enum']
})(({ remoteModules }) => {
  const [TablePage, Filter, usePreset, useFormModal, StateBar, Enum] = remoteModules;
  const { ajax, apis } = usePreset();
  const { SearchInput, getFilterValue, fields: filterFields } = Filter;
  const { InputFilterItem } = filterFields;
  const ref = useRef(null);
  const [filter, setFilter] = useState([]);
  const filterValue = getFilterValue(filter);
  const formModal = useFormModal();
  const { message } = App.useApp();

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
