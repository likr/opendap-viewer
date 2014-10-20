angular.module('opendap-viewer')
  .factory('light', () => {
    var light = new THREE.DirectionalLight(new THREE.Color('white'));
    light.position.set(0, 0, 1);
    return light;
  });
