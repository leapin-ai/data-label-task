import { createWithRemoteLoader } from '@kne/remote-loader';
import { Routes, Route } from 'react-router-dom';
import Task from './Task';
import Home from './Home';
import TaskDetail from './TaskDetail';
import style from './style.module.scss';

const Client = createWithRemoteLoader({
  modules: ['components-core:Menu']
})(({ remoteModules }) => {
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
      <Route index element={<Home menu={menu} />} />
      <Route path="/task/:id" element={<TaskDetail menu={menu} />} />
      <Route path="/task" element={<Task menu={menu} />} />
    </Routes>
  );
});

export default Client;
