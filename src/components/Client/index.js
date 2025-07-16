import { createWithRemoteLoader } from '@kne/remote-loader';
import { Routes, Route } from 'react-router-dom';
import Task from './Task';
import Home from './Home';
import TaskDetail from './TaskDetail';

const Client = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(({ remoteModules, ...props }) => {
  const [Menu] = remoteModules;
  const menu = (
    <Menu
      items={[
        { key: 'home', label: '工作台', path: '/' },
        { key: 'task', label: '我的任务', path: '/task' }
      ]}
    />
  );
  return (
    <Routes>
      <Route index element={<Home {...props} menu={menu} />} />
      <Route path="/task/:id" element={<TaskDetail {...props} menu={menu} />} />
      <Route path="/task" element={<Task {...props} menu={menu} />} />
    </Routes>
  );
});

export default Client;
