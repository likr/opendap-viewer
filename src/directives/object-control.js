angular.module('opendap-viewer')
  .controller('ObjectController', class {
    constructor(scene, objects) {
      this.scene = scene;
      this.objects = objects;
    }

    toggle(object) {
      if (object.show) {
        this.scene.add(object.mesh);
      } else {
        this.scene.remove(object.mesh);
      }
    }
  })
  .directive('objectControl', () => {
    return {
      controller: 'ObjectController as objectCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/object-control.html',
    };
  });
