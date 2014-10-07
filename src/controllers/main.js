angular.module('opendap-viewer')
  .config($stateProvider => {
    $stateProvider.state('main', {
      controller: 'MainController as main',
      templateUrl: 'partials/controllers/main.html',
      url: '/'
    });
  })
  .controller('MainController', class MainController {
    constructor(jqdap) {
      this.showControl = true;
    }

    toggleShowControl() {
      this.showControl = !this.showControl;
    }
  });
