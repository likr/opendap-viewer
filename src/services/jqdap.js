import angular from 'angular'
import vdap from 'vdap'

const modName = 'opendap-viewer.services.jqdap';

angular.module(modName, [])
  .factory('jqdap', ($q) => {
    return {
      loadDataset: (url, options) => {
        options.credentials = 'include';
        return $q.when(vdap.loadDataset(url, options));
      },
      loadData: (url, options) => {
        options.credentials = 'include';
        return $q.when(vdap.loadData(url, options));
      },
    };
  });

export default modName
