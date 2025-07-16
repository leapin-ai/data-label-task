
# Project


### 概述

项目


### 示例(全屏)

#### 示例代码

- 列表页
- 列表页
- remoteLoader(@kne/remote-loader),_Project(@components/Project),_mockPreset(@root/mockPreset)

```jsx
const { default: List } = _Project;
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

```

- 表单页
- 表单页
- remoteLoader(@kne/remote-loader),_Project(@components/Project),_mockPreset(@root/mockPreset)

```jsx
const { FormInner } = _Project;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:FormInfo@Form', 'components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [Form, PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Form>
        <FormInner />
      </Form>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- tab详情页
- tab详情页
- remoteLoader(@kne/remote-loader),_Project(@components/Project),_mockPreset(@root/mockPreset)

```jsx
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

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

