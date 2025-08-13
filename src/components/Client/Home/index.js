import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Flex } from 'antd';
import Lottie from '@components/Lottie';

const Home = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-document:MarkdownRender']
})(({ remoteModules, ...props }) => {
  const [Page, MarkdownRender] = remoteModules;

  return (
    <Page {...props}>
      <Fetch
        url={window.PUBLIC_URL + '/home.md'}
        ignoreSuccessState
        render={({ data }) => {
          return (
            <Flex vertical gap={24}>
              <Flex justify="center">
                <Lottie path={`${window.PUBLIC_URL}/lottiefiles/data-label.json`} style={{ height: '300px' }} />
              </Flex>
              <Flex
                style={{
                  padding: '0 120px'
                }}
              >
                <MarkdownRender content={data} assetsPath={window.PUBLIC_URL + '/assets'} />
              </Flex>
            </Flex>
          );
        }}
      />
    </Page>
  );
});

export default Home;
