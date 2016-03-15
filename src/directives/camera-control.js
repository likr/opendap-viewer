import angular from 'angular'
import THREE from 'three'

const modName = 'opendap-viewer.directives.camera';

angular.module(modName, [])
  .controller('CameraController', class {
    constructor($scope, camera, target) {
      this.camera = camera;
      this.target = target;
      this.latCenter = 0;
      this.lonCenter = 0;

      $scope.$watch(() => this.latCenter, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.lonCenter, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
    }

    resetCamera() {
      this.camera.position.set(this.lonCenter, this.latCenter, this.camera.position.z);
      this.camera.lookAt(new THREE.Vector3(this.lonCenter, this.latCenter, 0));
      this.camera.updateProjectionMatrix();
      this.target.set(this.lonCenter, this.latCenter, 0);
    }
  })
  .directive('cameraControl', () => {
    return {
      controller: 'CameraController as cameraCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/camera-control.html',
    };
  });

export default modName
