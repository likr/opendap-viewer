import angular from 'angular'
import THREE from 'three'

const modName = 'opendap-viewer.services.camera';

angular.module(modName, [])
  .factory('camera', () => {
    var theta = 45;
    var camera = new THREE.PerspectiveCamera(theta, 1, 0.1, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  });

export default modName
