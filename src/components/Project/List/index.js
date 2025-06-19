import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';
import { useRef, useState } from 'react';
import { Space, Button, App } from 'antd';
import FormInner from '../FormInner';
import { useNavigate } from 'react-router-dom';

const stateType = [
  { tab: '全部', key: 'all' },
  {
    tab: '进行中',
    key: 'open'
  },
  {
    tab: '待开启',
    key: 'close'
  }
];

const stateTypeMap = new Map(stateType.map(item => [item.key, item]));

const List = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:Global@usePreset', 'components-core:FormInfo@useFormModal', 'components-core:StateBar', 'components-core:Modal@useModal']
})(({ remoteModules }) => {
  const [TablePage, Filter, usePreset, useFormModal, StateBar] = remoteModules;
  const { ajax, apis } = usePreset();
  const { SearchInput, getFilterValue } = Filter;
  const ref = useRef(null);
  const [filter, setFilter] = useState([]);
  const filterValue = getFilterValue(filter);
  const formModal = useFormModal();
  const { message } = App.useApp();
  const navigate = useNavigate();
  return (
    <TablePage
      {...Object.assign({}, apis.project.list, {
        params: Object.assign({}, filterValue)
      })}
      ref={ref}
      pagination={{ paramsType: 'params' }}
      name="List"
      topArea={
        <StateBar
          type="radio"
          size="small"
          activeKey={filterValue.stateType || 'all'}
          onChange={value => {
            const currentState = stateTypeMap.get(value);
            setFilter(filter => {
              const newFilter = filter.slice(0);
              const currentIndex = filter.findIndex(item => item.name === 'stateType');
              if (currentIndex === -1) {
                newFilter.push({ name: 'stateType', value: { label: currentState.tab, value: currentState.key } });
              } else {
                newFilter.splice(currentIndex, 1, {
                  name: 'stateType',
                  value: { label: currentState.tab, value: currentState.key }
                });
              }
              return newFilter;
            });
          }}
          stateOption={stateType}
        />
      }
      page={{
        filter: {
          value: filter,
          onChange: setFilter,
          list: []
        },
        titleExtra: (
          <Space align="center">
            <SearchInput name="name" label="名称" />
            <Button
              type="primary"
              onClick={() => {
                formModal({
                  title: '添加数据',
                  autoClose: true,
                  formProps: {
                    onSubmit: async data => {
                      const { data: resData } = await ajax(Object.assign({}, apis.project.create, { data }));
                      if (resData.code !== 0) {
                        return false;
                      }
                      message.success('添加成功');
                      ref.current?.reload();
                    }
                  },
                  children: <FormInner />
                });
              }}
            >
              添加
            </Button>
          </Space>
        )
      }}
      columns={[
        ...getColumns(),
        {
          name: 'options',
          title: '操作',
          type: 'options',
          fixed: 'right',
          valueOf: item => {
            if (item.status === 'open') {
              return [
                {
                  children: '查看',
                  onClick: () => {
                    navigate(`/admin/project/${item.id}`);
                  }
                },
                {
                  children: '暂停',
                  isDelete: false,
                  message: '确定要暂停项目吗？可能有正在进行的关联任务无法继续进行',
                  onClick: async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.project.update, {
                        data: Object.assign(
                          {},
                          {
                            id: item.id,
                            status: 'close'
                          }
                        )
                      })
                    );
                    if (resData.code !== 0) {
                      return false;
                    }
                    message.success('暂停成功');
                    ref.current?.reload();
                  }
                }
              ];
            }
            return [
              {
                children: '查看',
                onClick: () => {
                  navigate(`/admin/project/${item.id}`);
                }
              },
              {
                children: '编辑',
                onClick: async () => {
                  formModal({
                    title: '编辑数据',
                    autoClose: true,
                    formProps: {
                      data: Object.assign({}, item),
                      onSubmit: async data => {
                        const { data: resData } = await ajax(Object.assign({}, apis.project.update, { data: Object.assign({}, data, { id: item.id }) }));
                        if (resData.code !== 0) {
                          return false;
                        }
                        message.success('保存成功');
                        ref.current?.reload();
                      }
                    },
                    children: <FormInner />
                  });
                }
              },
              {
                children: '开启',
                onClick: async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.project.update, {
                      data: Object.assign(
                        {},
                        {
                          id: item.id,
                          status: 'open'
                        }
                      )
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success('开启成功');
                  ref.current?.reload();
                }
              },
              {
                children: '删除',
                confirm: true,
                onClick: async () => {
                  const { data: resData } = await ajax(Object.assign({}, apis.project.remove, { data: { id: item.id } }));
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success('删除成功');
                  ref.current?.reload();
                }
              }
            ];
          }
        }
      ]}
    />
  );
});

export default List;
