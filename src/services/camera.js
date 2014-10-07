angular.module('opendap-viewer')
  .factory('camera', () => {
    var camera = new THREE.OrthographicCamera(-180, 180, 180, -180, 1, 2);
    camera.position.set(180, 0, 1);
    camera.lookAt(new THREE.Vector3(180, 0, 0));
    return camera;
  });
