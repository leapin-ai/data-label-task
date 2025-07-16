import { globalInit } from '../preset';
import { getApis } from '@components/Apis';
import merge from 'lodash/merge';
import { enums as projectEnums } from '@components/Project';

const apis = merge({}, getApis(), {
  admin: {
    getUserList: {
      loader: async () => {
        return import('./admin/user-list.json').then(({ default: data }) => {
          return data.data;
        });
      }
    }
  },
  project: {
    list: {
      loader: async () => {
        return import('./project/list.json').then(({ default: data }) => {
          return data.data;
        });
      }
    },
    detail: {
      loader: async () => {
        return import('./project/detail.json').then(({ default: data }) => {
          return data.data;
        });
      }
    }
  },
  dataSource: {
    list: {
      loader: async () => {
        return import('./dataSource/list.json').then(({ default: data }) => {
          return data.data;
        });
      }
    }
  },
  task: {
    list: {
      loader: async () => {
        return import('./task/list.json').then(({ default: data }) => {
          return data.data;
        });
      }
    },
    detail: {
      loader: async () => {
        return import('./task/detail.json').then(({ default: data }) => {
          return data.data;
        });
      }
    }
  },
  client: {
    task: {
      list: {
        loader: async () => {
          return import('./task/list.json').then(({ default: data }) => {
            return data.data;
          });
        }
      },
      detail: {
        loader: async () => {
          return import('./task/detail.json').then(({ default: data }) => {
            return data.data;
          });
        }
      }
    }
  }
});

const preset = {
  ajax: async ({ loader, ...props }) => {
    if (!loader && props.url) {
      const { ajax } = await globalInit();
      return ajax({ loader, ...props });
    }
    return Promise.resolve({ data: loader ? { code: 0, data: loader() } : { code: 0, data: {} } });
  },
  apis,
  enums: Object.assign({}, projectEnums)
};

export default preset;
