import { createWithRemoteLoader } from '@kne/remote-loader';

const Home = createWithRemoteLoader({
  modules: ['components-core:Layout@Page', 'components-core:Global@usePreset']
})(({ remoteModules, menu }) => {
  const [Page] = remoteModules;

  return <Page menu={menu}>欢迎👏</Page>;
});

export default Home;
