import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useParams, useSearchParams } from 'react-router-dom';
import { Flex } from 'antd';
import style from './style.module.scss';
import Basic from './Basic';
import List from './List';

const contentMap = { basic: Basic, list: List };

const TabDetail = createWithRemoteLoader({
  modules: ['components-core:Layout@StateBarPage', 'components-core:Global@usePreset', 'components-core:Layout@PageHeader', 'components-core:Enum', 'components-core:StateBar']
})(({ remoteModules, ...props }) => {
  const [StateBarPage, usePreset, PageHeader, Enum, StateBar] = remoteModules;
  const { apis } = usePreset();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <Fetch
      {...Object.assign({}, apis.task.detail, { params: { id } })}
      render={({ data, reload }) => {
        const activeKey = searchParams.get('tab') || 'basic';
        const ContentComponent = contentMap[activeKey] || Basic;
        return (
          <StateBarPage
            {...props}
            header={
              <Flex vertical>
                <PageHeader title={data.name} info={`ID: ${data.id}`} />
                <Enum moduleName="taskStatus">
                  {list => {
                    return (
                      <StateBar
                        className={style['header-bar']}
                        type="step"
                        size="small"
                        activeKey={data.status}
                        stateOption={list.map(({ value, description }) => ({
                          key: value,
                          tab: description
                        }))}
                      />
                    );
                  }}
                </Enum>
              </Flex>
            }
            stateBar={{
              activeKey,
              onChange: key => {
                searchParams.set('tab', key);
                setSearchParams(searchParams.toString());
              },
              stateOption: [
                { tab: '基本信息', key: 'basic' },
                { tab: '任务项', key: 'list' }
              ]
            }}
          >
            <ContentComponent data={data} />
          </StateBarPage>
        );
      }}
    />
  );
});

export default TabDetail;
