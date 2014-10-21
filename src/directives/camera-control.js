angular.module('opendap-viewer')
  .controller('CameraController', class {
    constructor($scope, camera, target) {
      this.camera = camera;
      this.target = target;
      this.latFrom = -90;
      this.latTo = 90;
      this.lonFrom = -180;
      this.lonTo = 180;

      $scope.$watch(() => this.latFrom, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.latTo, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.lonFrom, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.lonTo, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
    }

    resetCamera() {
      var width = this.latTo - this.latFrom;
      var height = this.lonTo - this.lonFrom;
      var size = Math.max(width, height / this.camera.aspect);
      var centerX = (this.lonTo + this.lonFrom) / 2;
      var centerY = (this.latTo + this.latFrom) / 2;
      var theta = this.camera.fov;
      this.camera.position.set(centerX, centerY, size / 2 / Math.tan(Math.PI * theta / 360));
      this.camera.lookAt(new THREE.Vector3(centerX, centerY, 0));
      this.camera.updateProjectionMatrix();
      this.target.set(centerX, centerY, 0);
    }
  })
  .directive('cameraControl', () => {
    return {
      controller: 'CameraController as cameraCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/camera-control.html'
    };
  });
