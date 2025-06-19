import { createWithRemoteLoader } from '@kne/remote-loader';

const BasicInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:InfoPage@TableView', 'components-core:InfoPage@Descriptions']
})(({ remoteModules, data }) => {
  const [InfoPage, TableView, Descriptions] = remoteModules;

  return (
    <InfoPage>
      <InfoPage.Part title="详情信息">
        <InfoPage.Part>
          <Descriptions
            dataSource={[
              [{ label: 'ID', content: data.id }],
              [
                {
                  label: '名称',
                  content: data.name
                }
              ],
              [{ label: '描述', content: data.description }]
            ]}
          />
        </InfoPage.Part>
        <InfoPage.Part title="字段列表">
          <TableView
            dataSource={data.fields}
            columns={[
              { name: 'name', title: '字段Key' },
              {
                name: 'label',
                title: '字段显示名称'
              },
              { name: 'annotateType', title: '字段类型' },
              {
                name: 'needAnnotate',
                title: '是否需要标注',
                format: 'boolean'
              },
              {
                name: 'needSearch',
                title: '是否需要列表搜索',
                format: 'boolean'
              }
            ]}
          />
        </InfoPage.Part>
      </InfoPage.Part>
    </InfoPage>
  );
});

export default BasicInfo;
