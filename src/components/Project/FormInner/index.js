import { createWithRemoteLoader } from '@kne/remote-loader';
import get from 'lodash/get';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { TableList, List } = FormInfo;
  const { Input, TextArea, Select, Switch } = FormInfo.fields;

  return (
    <>
      <FormInfo list={[<Input name="name" label="项目名称" rule="REQ" block />, <TextArea name="description" label="项目描述" block />]} />
      <List
        isUnshift={false}
        name="fields"
        title="字段列表"
        list={[
          <Input name="name" label="字段KEY" rule="REQ LEN-0-100" />,
          <Input name="label" label="字段显示名称" rule="REQ LEN-0-100" />,
          <Select
            name="annotateType"
            label="字段类型"
            rule="REQ"
            options={[
              { value: 'string', label: '字符串' },
              { value: 'text', label: '文本' },
              { value: 'richText', label: '富文本' },
              { value: 'boolean', label: '布尔值' },
              { value: 'number', label: '数字' },
              { value: 'file', label: '文件' },
              { value: 'enum', label: '枚举' },
              { value: 'hidden', label: '隐藏字段' },
              { value: 'compare', label: '比较文本' }
            ]}
          />,
          <Input type="hidden" name="needAnnotate" defaultValue="true" display={({ formData, groupArgs }) => get(formData, `fields.${groupArgs[0].index}.annotateType`) === 'compare'} />,
          <Switch name="needAnnotate" label="是否需要标注" display={({ formData, groupArgs }) => ['hidden', 'compare'].indexOf(get(formData, `fields.${groupArgs[0].index}.annotateType`)) === -1} />,
          <Input
            name="annotateRule"
            label="标注校验规则"
            defaultValue="REQ"
            display={({ formData, groupArgs }) => {
              return get(formData, `fields.${groupArgs[0].index}.needAnnotate`);
            }}
          />,
          <Switch
            name="needSearch"
            label="是否需要列表搜索"
            display={({ formData, groupArgs }) => {
              return ['string', 'text', 'boolean', 'number', 'enum'].indexOf(get(formData, `fields.${groupArgs[0].index}.annotateType`)) > -1;
            }}
          />,
          <TableList
            block
            display={({ formData, groupArgs }) => get(formData, `fields.${groupArgs[0].index}.annotateType`) === 'enum'}
            name="annotateEnum"
            title="枚举值列表"
            list={[<Input name="label" label="枚举值显示名称" rule="REQ LEN-0-100" />, <Input name="value" label="枚举值" rule="REQ LEN-0-100" />]}
          />
        ]}
      />
    </>
  );
});

export default FormInner;
