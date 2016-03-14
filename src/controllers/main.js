import angular from 'angular'

const modName = 'opendap-viewer.controllers.main-controller'

angular.module(modName, [])
  .controller('MainController', class MainController {
    constructor() {
      this.showControl = true;
      this.objects = [];
    }

    toggleShowControl() {
      this.showControl = !this.showControl;
    }
  });

export default modName
