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

      var url = 'http://dias:akaika0530@localhost/dias/dods/secret/s';
      jqdap.loadDataset(url)
        .then(data => {
          console.log(data);
        });
    }

    toggleShowControl() {
      this.showControl = !this.showControl;
    }
  });
