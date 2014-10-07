angular.module('opendap-viewer')
  .config($stateProvider => {
    $stateProvider.state('main', {
      controller: 'MainController',
      templateUrl: 'partials/main.html',
      url: '/'
    });
  })
  .controller('MainController', () => {
  });
