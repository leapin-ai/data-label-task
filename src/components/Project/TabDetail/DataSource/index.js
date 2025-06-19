import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, Alert } from 'antd';
import { useState, useRef } from 'react';

const DataSource = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table@TablePage', 'components-core:FormInfo', 'components-core:File@Download']
})(({ remoteModules, data }) => {
  const [usePreset, TablePage, FormInfo, Download] = remoteModules;
  const { ajax, apis } = usePreset();
  const [selected, setSelected] = useState([]);
  const { useFormModal } = FormInfo;
  const formModal = useFormModal();
  const { Upload } = FormInfo.fields;
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
          <Button size="small">批量操作{selected.length > 0 ? `(${selected.length}条)` : ''}</Button>
        </Flex>
      </Flex>
      <TablePage
        {...Object.assign({}, apis.dataSource.list, {
          params: { projectId: data.id },
          transformData: data => {
            return Object.assign({}, data, {
              pageData: data.pageData.map(item => {
                return item.data;
              })
            });
          }
        })}
        name="data-source-list"
        pagination={{ paramsType: 'params' }}
        ref={ref}
        columns={[
          ...data.fields.map(({ name, label }) => {
            return {
              name: name,
              title: label
            };
          })
        ]}
      />
    </Flex>
  );
});

export default DataSource;
