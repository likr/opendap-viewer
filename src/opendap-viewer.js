angular.module('opendap-viewer', ['ui.router', 'ngDragDrop']);

angular.module('opendap-viewer')
  .config($urlRouterProvider => {
    $urlRouterProvider.otherwise('/');
  });
