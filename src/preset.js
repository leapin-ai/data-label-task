import React from 'react';
import { preset as fetchPreset } from '@kne/react-fetch';
import { Spin, Empty, message } from 'antd';
import { preset as remoteLoaderPreset, loadModule } from '@kne/remote-loader';
import createAjax from '@kne/axios-fetch';
import { getToken } from '@kne/token-storage';
import transform from 'lodash/transform';
import { getApis } from '@components/Apis';
import { enums as projectEnums } from '@components/Project';

window.PUBLIC_URL = window.runtimePublicUrl || process.env.PUBLIC_URL;
const cdnHost = window.runtimeEnv?.['cdnHost'] || 'https://cdn.leapin-ai.com';
const appName = 'data-label-service';
const env = window.runtimeEnv?.['env'] || 'local';
const baseApiUrl = window.runtimeApiUrl || '';

export const globalInit = async () => {
  const ajax = createAjax({
    baseURL: baseApiUrl,
    errorHandler: error => message.error(error),
    getDefaultHeaders: () => {
      return {
        'X-User-Token': getToken('X-User-Token'),
        appName,
        env
      };
    },
    registerInterceptors: interceptors => {
      interceptors.request.use(config => {
        if (config.headers['env'] !== 'local') {
          config.baseURL = `${config.baseURL}/${config.headers['appName']}/${config.headers['env']}`;
        }
        delete config.headers['appName'];
        delete config.headers['env'];
        return config;
      });
      interceptors.response.use(response => {
        if (response.status === 401 || response.data.code === 401) {
          const searchParams = new URLSearchParams(window.location.search);
          const referer = encodeURIComponent(window.location.pathname + window.location.search);
          searchParams.append('referer', referer);
          window.location.href = '/account/login?' + searchParams.toString();
          response.showError = false;
        }
        return response;
      });
    }
  });

  fetchPreset({
    ajax,
    loading: (
      <Spin
        delay={500}
        style={{
          position: 'absolute',
          left: '50%',
          padding: '10px',
          transform: 'translateX(-50%)'
        }}
      />
    ),
    error: null,
    empty: <Empty />,
    transformResponse: response => {
      const { data } = response;
      response.data = {
        code: data.code === 0 ? 200 : data.code,
        msg: data.msg,
        results: data.data
      };
      return response;
    }
  });
  const registry = {
    url: 'https://uc.fatalent.cn',
    tpl: '{{url}}/packages/@kne-components/{{remote}}/{{version}}/build'
  };

  const componentsCoreRemote = {
    ...registry,
    //url: 'http://localhost:3001',
    //tpl: '{{url}}',
    remote: 'components-core',
    defaultVersion: '0.4.15'
  };
  remoteLoaderPreset({
    remotes: {
      default: componentsCoreRemote,
      'components-core': componentsCoreRemote,
      'components-iconfont': {
        ...registry,
        remote: 'components-iconfont',
        defaultVersion: '0.2.1'
      },
      'components-ckeditor': {
        ...registry,
        remote: 'components-ckeditor',
        defaultVersion: '0.2.5'
      },
      'components-file-manager': {
        ...registry,
        remote: 'components-file-manager',
        defaultVersion: '0.1.1'
      },
      'components-document': {
        ...registry,
        remote: 'components-document',
        defaultVersion: '0.1.6'
      },
      'components-admin': {
        ...registry,
        //url: 'http://localhost:3016',
        //tpl: '{{url}}',
        remote: 'components-admin',
        defaultVersion: '1.0.10'
      },
      'data-label-task':
        process.env.NODE_ENV === 'development'
          ? {
              remote: 'data-label-task',
              url: '/',
              tpl: '{{url}}',
              defaultVersion: process.env.DEFAULT_VERSION
            }
          : {
              url: cdnHost,
              tpl: `{{url}}/${appName}/${env}`,
              remote: 'data-label-task',
              defaultVersion: process.env.DEFAULT_VERSION
            }
    }
  });

  const safeLoadApis = async name => {
    try {
      return await loadModule(name).then(({ default: defaultModule }) => defaultModule);
    } catch (e) {
      console.error(e);
      return () => {
        return {};
      };
    }
  };
  const remoteApis = await (async () => {
    const input = {
      fileManager: 'components-file-manager:Apis@getApis'
    };

    const remoteApiKeys = Object.keys(input);
    return transform(
      await Promise.all(remoteApiKeys.map(name => safeLoadApis(Array.isArray(input[name]) ? input[name][0] : input[name]))),
      (result, value, index) => {
        const name = remoteApiKeys[index];
        result[name] = value(input[name][1]);
      },
      {}
    );
  })();
  const getAccountApis = await safeLoadApis('components-admin:Apis@getApis');

  return {
    ajax,
    staticUrl: baseApiUrl,
    enums: Object.assign({}, projectEnums),
    apis: Object.assign(
      {},
      getAccountApis(),
      remoteApis,
      {
        file: {
          contentWindowUrl: 'https://uc.fatalent.cn/components/@kne/iframe-resizer/0.1.3/dist/contentWindow.js',
          pdfjsUrl: 'https://uc.fatalent.cn/components/pdfjs-dist/4.4.168',
          getUrl: {
            url: `/api/v1/static/file-url/{id}`,
            paramsType: 'urlParams',
            ignoreSuccessState: true
          },
          upload: ({ file }) => {
            return ajax.postForm({
              url: `/api/v1/static/upload`,
              data: { file }
            });
          }
        }
      },
      getApis()
    ),
    formInfo: {
      rules: {
        NUM_VALUE: (value, start, end) => {
          value = Number(value);
          if (end === start && value !== Number(end)) {
            return {
              result: false,
              errMsg: `%s必须等于${end}`
            };
          }
          if (value < start) {
            return {
              result: false,
              errMsg: `%s必须大于等于${start}`
            };
          }
          if (end && value > end) {
            return {
              result: false,
              errMsg: `%s必须小于等于${end}`
            };
          }
          return { result: true };
        }
      }
    },
    themeToken: {
      colorPrimary: '#4183F0'
    }
  };
};
