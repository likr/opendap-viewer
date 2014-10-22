angular.module('opendap-viewer')
  .factory('jqdap', ($window, $q) => {
    return {
      loadDataset: (url, options) => {
        return $q.when($window.jqdap.loadDataset(url, options));
      },
      loadData: (url, options) => {
        return $q.when($window.jqdap.loadData(url, options));
      }
    };
  });
