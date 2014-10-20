angular.module('opendap-viewer')
  .factory('scene', (light) => {
    var scene = new THREE.Scene();
    scene.add(light);
    return scene;
  });
