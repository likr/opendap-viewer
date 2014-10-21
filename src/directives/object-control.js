angular.module('opendap-viewer')
  .controller('ObjectController', class {
    constructor($scope, scene) {
      this.objects = $scope.objects;
      this.scene = scene;
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
      scope: {
        objects: '='
      },
      templateUrl: 'partials/directives/object-control.html',
    };
  });
