import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Basic = createWithRemoteLoader({
  modules: ['components-core:Descriptions', 'components-core:InfoPage', 'components-ckeditor:Editor.Content']
})(({ remoteModules, data }) => {
  const [Descriptions, InfoPage, EditorContent] = remoteModules;
  const navigate = useNavigate();
  return (
    <InfoPage>
      <InfoPage.Part>
        <InfoPage.Part>
          <Descriptions
            dataSource={[
              [
                { label: 'ID', content: data.id },
                {
                  label: '名称',
                  content: data.name
                }
              ],
              [
                { label: '指派人', content: data.allocatorUser?.nickname || data.allocatorUser?.email },
                {
                  label: '添加人',
                  content: data.createdUser?.nickname || data.createdUser?.email
                }
              ],
              [
                {
                  label: '截止日期',
                  content: data.completeTime
                },
                {
                  label: '创建时间',
                  content: data.createdAt
                }
              ],
              [
                {
                  label: '所属项目',
                  content: (
                    <Button
                      className="btn-no-padding"
                      type="link"
                      onClick={() => {
                        navigate(`/admin/project/${data.project.id}`);
                      }}
                    >
                      {data.project.name}
                    </Button>
                  )
                }
              ],
              [{ label: '描述', content: <EditorContent>{data.description}</EditorContent> }]
            ]}
          />
        </InfoPage.Part>
      </InfoPage.Part>
    </InfoPage>
  );
});

export default Basic;
