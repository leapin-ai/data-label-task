const getApis = options => {
  const { prefix } = Object.assign({}, { prefix: '/api/v1' }, options);

  return {
    project: {
      list: {
        url: `${prefix}/project/list`,
        method: 'GET'
      },
      create: {
        url: `${prefix}/project/create`,
        method: 'POST'
      },
      update: {
        url: `${prefix}/project/update`,
        method: 'POST'
      },
      remove: {
        url: `${prefix}/project/remove`,
        method: 'POST'
      },
      detail: {
        url: `${prefix}/project/detail`,
        method: 'GET'
      }
    },
    dataSource: {
      downloadTemplate: {
        url: `${prefix}/data-source/download-template`,
        method: 'GET'
      },
      list: {
        url: `${prefix}/data-source/list`,
        method: 'GET'
      },
      includeData: {
        url: `${prefix}/data-source/include`,
        method: 'POST'
      }
    },
    task: {
      create: {
        url: `${prefix}/task/create`,
        method: 'POST'
      },
      save: {
        url: `${prefix}/task/save`,
        method: 'POST'
      },
      list: {
        url: `${prefix}/task/list`,
        method: 'GET'
      },
      caseList: {
        url: `${prefix}/task/case-list`,
        method: 'GET'
      },
      detail: {
        url: `${prefix}/task/detail`,
        method: 'GET'
      },
      appendCase: {
        url: `${prefix}/task/append-case`,
        method: 'POST'
      },
      removeCase: {
        url: `${prefix}/task/remove-case`,
        method: 'POST'
      },
      action: {
        url: `${prefix}/task/action`,
        method: 'POST'
      },
      allocator: {
        url: `${prefix}/task/allocator`,
        method: 'POST'
      },
      split: {
        url: `${prefix}/task/split`,
        method: 'POST'
      },
      copy: {
        url: `${prefix}/task/copy`,
        method: 'POST'
      },
      exportResult: {
        url: `${prefix}/task/export-result`,
        method: 'GET'
      }
    },
    client: {
      task: {
        list: {
          url: `${prefix}/client/task/list`,
          method: 'GET'
        },
        detail: {
          url: `${prefix}/client/task/detail`,
          method: 'GET'
        }
      },
      taskCase: {
        list: {
          url: `${prefix}/client/task-case/list`,
          method: 'GET'
        },
        detail: {
          url: `${prefix}/client/task-case/detail`,
          method: 'GET'
        },
        submit: {
          url: `${prefix}/client/task-case/submit`,
          method: 'POST'
        },
        complete: {
          url: `${prefix}/client/task-case/complete`,
          method: 'POST'
        }
      }
    }
  };
};

export default getApis;
