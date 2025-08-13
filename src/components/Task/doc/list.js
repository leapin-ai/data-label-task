const { default: List } = _Task;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Global@usePreset', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, usePreset, Layout] = remoteModules;
  const { ajax } = usePreset();
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <List />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
