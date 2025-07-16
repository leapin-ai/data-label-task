import { createWithRemoteLoader } from '@kne/remote-loader';

const Home = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset']
})(({ remoteModules, ...props }) => {
  const [Page] = remoteModules;

  return <Page {...props}>欢迎👏</Page>;
});

export default Home;
