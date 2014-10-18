angular.module('opendap-viewer')
  .config($stateProvider => {
    $stateProvider.state('main', {
      controller: 'MainController as main',
      templateUrl: 'partials/controllers/main.html',
      url: '/'
    });
  })
  .controller('MainController', class MainController {
    constructor() {
      this.showControl = false;
      this.showDatasetControl = true;
    }

    toggleShowControl() {
      this.showControl = !this.showControl;
    }
  });
