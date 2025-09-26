import loadable from '@loadable/component';
import { Spin } from 'antd';

const loadableWithProps = func =>
  loadable(func, {
    fallback: <Spin style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
  });

const pages = {
  Home: loadableWithProps(() => import('./Home')),
  Account: loadableWithProps(() => import('./Account')),
  Admin: loadableWithProps(() => import('./Admin')),
  InitAdmin: loadableWithProps(() => import('./Admin').then(({ InitAdmin }) => InitAdmin)),
  Error: loadableWithProps(() => import('./Error')),
  NotFound: loadableWithProps(() => import('./NotFound')),
  Client: loadableWithProps(() => import('../components/Client')),
  ProjectTabDetail: loadableWithProps(() => import('../components/Project/TabDetail')),
  ProjectList: loadableWithProps(() => import('../components/Project/List')),
  TaskTabDetail: loadableWithProps(() => import('../components/Task/TabDetail')),
  TaskList: loadableWithProps(() => import('../components/Task/List'))
};

export default pages;
