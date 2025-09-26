import RemoteLoader, { createWithRemoteLoader } from '@kne/remote-loader';
import { Routes, Route, Navigate } from 'react-router-dom';
import pages from './pages';
import './index.scss';

const { TaskList, TaskTabDetail, ProjectList, ProjectTabDetail, Client, Account, Admin, InitAdmin, Error, NotFound } = pages;

const App = createWithRemoteLoader({
  modules: ['components-core:Global', 'components-admin:Authenticate@BeforeLoginLayout', 'components-admin:Authenticate@AfterUserLoginLayout', 'components-admin:Authenticate@AfterAdminUserLoginLayout']
})(({ remoteModules, globalPreset }) => {
  const [Global, BeforeLoginLayout, AfterUserLoginLayout, AfterAdminUserLoginLayout] = remoteModules;
  const baseUrl = '';
  return (
    <Global preset={globalPreset} themeToken={globalPreset.themeToken}>
      <Routes>
        <Route path="admin/initAdmin" element={<AfterUserLoginLayout />}>
          <Route index element={<InitAdmin baseUrl={`${baseUrl}/admin`} />} />
        </Route>
        <Route
          path="admin"
          element={
            <AfterAdminUserLoginLayout
              navigation={{
                base: `${baseUrl}/admin`,
                list: [
                  {
                    key: 'project',
                    title: '项目管理',
                    path: '/admin/project'
                  },
                  {
                    key: 'task',
                    title: '任务管理',
                    path: '/admin/task'
                  },
                  {
                    key: 'user',
                    title: '用户管理',
                    path: '/admin/user'
                  },
                  {
                    key: 'file',
                    title: '文件管理',
                    path: '/admin/file'
                  },
                  {
                    key: 'signature',
                    title: '密钥管理',
                    path: '/admin/signature'
                  }
                ]
              }}
            />
          }
        >
          <Route index element={<Navigate to={`${baseUrl}/admin/project`} replace />} />
          <Route path="project/:id" element={<ProjectTabDetail />} />
          <Route path="project" element={<ProjectList />} />
          <Route path="task/:id" element={<TaskTabDetail />} />
          <Route path="task" element={<TaskList />} />
          <Route path="file" element={<RemoteLoader module="components-file-manager:FileListPage" />} />
          <Route path="signature" element={<RemoteLoader module="components-admin:Signature" />} />
          <Route path="*" element={<Admin baseUrl={`${baseUrl}/admin`} />} />
        </Route>
        <Route
          element={
            <AfterUserLoginLayout
              baseUrl={baseUrl}
              navigation={{
                showIndex: false
              }}
            />
          }
        >
          <Route path="*" element={<Client />} />
        </Route>
        <Route element={<BeforeLoginLayout />}>
          <Route path="error" element={<Error />} />
          <Route path="404" element={<NotFound />} />
          <Route path="account/*" element={<Account baseUrl={baseUrl + '/account'} systemName="LeapIn数据标注平台" systemLogo={window.PUBLIC_URL + '/favicon.svg'} />} />
        </Route>
      </Routes>
    </Global>
  );
});

export default App;
