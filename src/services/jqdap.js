angular.module('opendap-viewer')
  .factory('jqdap', ($window, $q) => {
    return {
      loadDataset: (url) => {
        return $q.when($window.jqdap.loadDataset(url, {
          withCredentials: true,
        }));
      },
      loadData: (url) => {
        return $q.when($window.jqdap.loadData(url, {
          withCredentials: true,
        }));
      }
    };
  });
