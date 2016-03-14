import angular from 'angular'
import THREE from 'three'

const modName = 'opendap-viewer.services.target'

angular.module(modName, [])
  .factory('target', () => {
    return new THREE.Vector3();
  });

export default modName
