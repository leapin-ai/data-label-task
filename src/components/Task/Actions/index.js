import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button } from 'antd';
import Start from './Start';
import Reset from './Reset';
import Completed from './Completed';
import Confirmed from './Confirmed';
import Closed from './Closed';
import Allocator from './Allocator';
import Copy from './Copy';

const actionMap = {
  pending: Reset,
  inProgress: Start,
  completed: Completed,
  confirmed: Confirmed,
  allocator: Allocator,
  closed: Closed,
  copy: Copy
};

const Actions = createWithRemoteLoader({
  modules: ['components-core:ButtonGroup']
})(({ remoteModules, list = [], data, onSuccess, more, ...props }) => {
  const [ButtonGroup] = remoteModules;
  const statusTransitions = {
    pending: ['inProgress', 'allocator', 'copy', 'closed'],
    inProgress: ['completed', 'copy', 'closed'],
    completed: ['confirmed', 'copy', 'closed'],
    confirmed: ['copy', 'closed'],
    closed: ['pending', 'copy']
  };

  const targetList = statusTransitions[data.status].map(name => {
    return actionMap[name];
  });

  return (
    <ButtonGroup
      list={[
        ...list.map(item => {
          return Object.assign({}, props, item, { data });
        }),
        ...targetList.map(item => {
          return {
            ...props,
            data,
            buttonComponent: item,
            onSuccess
          };
        })
      ]}
      more={more}
    />
  );
});

export default Actions;
