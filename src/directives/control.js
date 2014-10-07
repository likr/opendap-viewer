angular.module('opendap-viewer')
  .controller('ControlController', class ControlController {
  })
  .directive('control', () => {
    return {
      controller: 'ControlController as ctl',
      restrict: 'E',
      templateUrl: 'partials/directives/control.html',
    };
  });
