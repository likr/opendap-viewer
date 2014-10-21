angular.module('opendap-viewer')
  .directive('control', () => {
    return {
      restrict: 'E',
      templateUrl: 'partials/directives/control.html',
    };
  });
