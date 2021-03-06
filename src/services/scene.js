import angular from 'angular'
import THREE from 'three'

const modName = 'opendap-viewer.services.scene';

angular.module(modName, [])
  .factory('scene', () => {
    var scene = new THREE.Scene();
    var light1 = new THREE.DirectionalLight(new THREE.Color('white'));
    light1.position.set(0, 0, 1);
    scene.add(light1);
    var light2 = new THREE.DirectionalLight(new THREE.Color('white'));
    light2.position.set(0, 0, -1);
    scene.add(light2);
    return scene;
  });

export default modName
