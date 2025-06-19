import RemoteLoader, { createWithRemoteLoader } from '@kne/remote-loader';
import { Routes, Route, Navigate } from 'react-router-dom';
import pages from './pages';
import './index.scss';

const { Account, Admin, InitAdmin, Home, Error, NotFound } = pages;

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
                  }
                ]
              }}
            />
          }
        >
          <Route index element={<Navigate to={`${baseUrl}/admin/project`} replace />} />
          <Route path="project/:id" element={<RemoteLoader key="project-detail" module="data-label-task:Project@TabDetail" />} />
          <Route path="project" element={<RemoteLoader key="project" module="data-label-task:Project@List" />} />
          <Route path="task/:id" element={<RemoteLoader key="task-detail" module="data-label-task:Task@TabDetail" />} />
          <Route path="task" element={<RemoteLoader key="task" module="data-label-task:Task@List" />} />
          <Route path="file" element={<RemoteLoader module="components-file-manager:FileListPage" />} />
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
          <Route path="*" element={<RemoteLoader key="client" module="data-label-task:Client" />} />
        </Route>
        <Route element={<BeforeLoginLayout />}>
          <Route path="error" element={<Error />} />
          <Route path="404" element={<NotFound />} />
          <Route path="account/*" element={<Account baseUrl={baseUrl + '/account'} />} />
        </Route>
      </Routes>
    </Global>
  );
});

export default App;
