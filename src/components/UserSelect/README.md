
# UserSelect


### 概述

选择一个用户


### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _UserSelect(@components/UserSelect),remoteLoader(@kne/remote-loader),_mockPreset(@root/mockPreset)

```jsx
const { default: UserSelect } = _UserSelect;
const { createWithRemoteLoader } = remoteLoader;
const { default: mockPreset } = _mockPreset;
const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:FormInfo@Form']
})(({ remoteModules }) => {
  const [PureGlobal, Form] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Form>
        <UserSelect />
      </Form>
    </PureGlobal>
  );
});

render(<BaseExample />);

```


### API

|属性名|说明|类型|默认值|
|  ---  | ---  | --- | --- |

