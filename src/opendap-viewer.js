angular.module('opendap-viewer', ['ui.router']);

angular.module('opendap-viewer')
  .config($urlRouterProvider => {
    $urlRouterProvider.otherwise('/');
  });
