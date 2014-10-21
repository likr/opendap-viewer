angular.module('opendap-viewer')
  .controller('MainController', class MainController {
    constructor() {
      this.showControl = true;
      this.objects = [];
    }

    toggleShowControl() {
      this.showControl = !this.showControl;
    }
  });
