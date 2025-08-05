import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';
import { useNavigate } from 'react-router-dom';
import Actions from '../Actions';

const CreateList = createWithRemoteLoader({
  modules: ['components-core:Enum', 'components-core:StateTag']
})(({ remoteModules, onSuccess, children }) => {
  const [Enum, StateTag] = remoteModules;
  const navigate = useNavigate();
  return children({
    columns: [
      ...getColumns({
        navigateTo: navigate,
        renderRichText: item => {
          const dom = document.createElement('div');
          dom.innerHTML = item;
          return dom.innerText;
        },
        renderTaskStatus: item => {
          return (
            <Enum moduleName="taskStatus" name={item}>
              {({ value, type, description }) => {
                return <StateTag type={type} text={description} />;
              }}
            </Enum>
          );
        }
      }),
      {
        name: 'options',
        title: '操作',
        type: 'options',
        fixed: 'right',
        valueOf: item => {
          return {
            children: ({ buttonProps, more }) => (
              <Actions
                {...buttonProps}
                more={more}
                data={item}
                list={[
                  {
                    children: '查看',
                    onClick: () => {
                      navigate(`/admin/task/${item.id}`);
                    }
                  }
                ]}
                onSuccess={onSuccess}
              />
            )
          };
        }
      }
    ]
  });
});

export default CreateList;
