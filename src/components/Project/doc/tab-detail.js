const { TabDetail } = _Project;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <TabDetail optionFixed={false} />
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
