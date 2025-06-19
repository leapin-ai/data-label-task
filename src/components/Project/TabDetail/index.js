import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useParams, useSearchParams } from 'react-router-dom';
import BasicInfo from './BasicInfo';
import DataSource from './DataSource';
import Task from './Task';

const contentMap = { basicInfo: BasicInfo, dataSource: DataSource, task: Task };

const TabDetail = createWithRemoteLoader({
  modules: ['components-core:Layout@StateBarPage', 'components-core:Layout@PageHeader', 'components-core:StateTag', 'components-core:Global@usePreset']
})(({ remoteModules, ...props }) => {
  const [StateBarPage, PageHeader, StateTag, usePreset] = remoteModules;
  const { apis } = usePreset();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Fetch
      {...Object.assign({}, apis.project.detail, { params: { id } })}
      render={({ data, reload }) => {
        const activeKey = (data.status === 'open' && searchParams.get('tab')) || 'basicInfo';
        const ContentComponent = contentMap[activeKey] || BasicInfo;
        return (
          <StateBarPage
            {...props}
            stateBar={{
              activeKey,
              onChange: key => {
                searchParams.set('tab', key);
                setSearchParams(searchParams.toString());
              },
              stateOption: [
                { tab: '基本信息', key: 'basicInfo' },
                { tab: '数据源', key: 'dataSource', disabled: data.status !== 'open' },
                { tab: '任务', key: 'task', disabled: data.status !== 'open' }
              ]
            }}
            header={<PageHeader title={data.name} info={`ID: ${data.id}`} tags={[data.status === 'open' ? <StateTag type="success" text="进行中" /> : <StateTag type="text" text="待开启" />]} />}
          >
            <ContentComponent data={data} />
          </StateBarPage>
        );
      }}
    />
  );
});

export default TabDetail;
