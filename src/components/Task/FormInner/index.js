import { createWithRemoteLoader } from '@kne/remote-loader';

const FormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;
  return (
    <>
      <FormInfo list={[<Input name="field1" label="字段一" rule="REQ" />, <Input name="field2" label="字段二" rule="REQ" />, <TextArea name="description" label="描述" block />]} />
    </>
  );
});

export default FormInner;
