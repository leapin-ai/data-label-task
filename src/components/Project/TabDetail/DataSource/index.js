import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, Alert, Dropdown, App } from 'antd';
import { useRef } from 'react';
import style from '../style.module.scss';

const DataSource = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table', 'components-core:FormInfo', 'components-core:File@Download', 'components-core:ConfirmButton']
})(({ remoteModules, data }) => {
  const [usePreset, Table, FormInfo, Download, ConfirmButton] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const { Upload } = FormInfo.fields;
  const { TablePage, useSelectedRow } = Table;
  const selectedRow = useSelectedRow();
  const { selectedRowKeys, setSelectedRowKeys } = selectedRow;
  const ref = useRef();
  return (
    <Flex vertical gap={8} flex={1}>
      <Flex justify="space-between">
        <div></div>
        <Flex gap={8}>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              const formModalApi = formModal({
                title: '上传数据',
                size: 'small',
                formProps: {
                  onSubmit: async formData => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.dataSource.includeData, {
                        data: {
                          projectId: data.id,
                          fileIds: formData.files.map(file => file.id)
                        }
                      })
                    );
                    if (resData.code !== 0) {
                      return;
                    }

                    ref.current.reload();
                    formModalApi.close();
                  }
                },
                saveText: '上传',
                children: (
                  <Flex vertical gap={8}>
                    <Alert
                      message={
                        <Flex align="center" justify="space-between">
                          请先下载数据模版，并按照数据模版格式上传数据。
                          <Download type="link" src={`${apis.dataSource.downloadTemplate.url}?projectId=${data.id}`}>
                            点击下载数据模版
                          </Download>
                        </Flex>
                      }
                    />
                    <FormInfo column={1} list={[<Upload name="files" label="文件" />]} />
                  </Flex>
                )
              });
            }}
          >
            上传数据
          </Button>
          <Dropdown
            rootClassName={style['menu-list']}
            menu={{
              items: [
                {
                  key: 'remove',
                  label: (
                    <ConfirmButton
                      size="small"
                      className="button-group-item"
                      onClick={async () => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.dataSource.removeBatch, {
                            data: { ids: selectedRowKeys }
                          })
                        );
                        if (resData.code !== 0) {
                          return;
                        }
                        message.success('删除成功');
                        setSelectedRowKeys([]);
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
            <Button size="small" disabled={selectedRowKeys.length === 0}>
              批量操作{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length}条)` : ''}
            </Button>
          </Dropdown>
        </Flex>
      </Flex>
      <TablePage
        {...Object.assign({}, apis.dataSource.list, {
          params: { projectId: data.id },
          transformData: data => {
            return Object.assign({}, data, {
              pageData: data.pageData.map(item => {
                return Object.assign({}, item.data, { id: item.id });
              })
            });
          }
        })}
        name="data-source-list"
        pagination={{ paramsType: 'params' }}
        ref={ref}
        rowSelection={selectedRow}
        columns={[
          {
            name: 'id',
            title: 'ID'
          },
          ...data.fields.map(({ name, label }) => {
            return {
              name: name,
              title: label,
              ellipsis: true
            };
          })
        ]}
      />
    </Flex>
  );
});

export default DataSource;
