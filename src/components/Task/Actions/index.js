import { createWithRemoteLoader } from '@kne/remote-loader';
import Start from './Start';
import Reset from './Reset';
import Completed from './Completed';
import Confirmed from './Confirmed';
import Closed from './Closed';

const actionMap = {
  pending: Reset,
  inProgress: Start,
  completed: Completed,
  confirmed: Confirmed,
  closed: Closed
};

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, list = [], buttonProps, data, onSuccess, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const statusTransitions = {
    pending: ['inProgress'],
    inProgress: ['completed', 'closed'],
    completed: ['confirmed', 'closed'],
    confirmed: ['closed'],
    closed: ['pending']
  };

  const targetList = statusTransitions[data.status].map(name => {
    return actionMap[name];
  });

  return (
    <ButtonGroup
      {...props}
      list={[
        ...list.map(item => {
          return Object.assign({}, buttonProps, item);
        }),
        ...targetList.map(item => {
          const ButtonComponent = item;
          return props => {
            return <ButtonComponent {...props} {...buttonProps} data={data} onSuccess={onSuccess} />;
          };
        })
      ]}
    />
  );
});

export default Actions;
