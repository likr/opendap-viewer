import angular from 'angular'

const modName = 'opendap-viewer.directives.control';

angular.module(modName, [])
  .directive('control', () => {
    return {
      restrict: 'E',
      templateUrl: 'partials/directives/control.html',
    };
  });

export default modName
