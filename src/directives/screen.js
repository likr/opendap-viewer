import angular from 'angular'
import THREE from 'three'
import TrackballControls from 'three.trackball'

const modName = 'opendap-viewer.directives.screen';

angular.module(modName, [])
  .directive('screen', ($window, jqdap, scene, camera, target) => {
    return {
      link: (scope, element) => {
        var width = element.width();
        var height = element.height();

        camera.aspect = width / height;
        camera.position.set(0, 0, Math.max(90, 180 / camera.aspect) / Math.tan(Math.PI * camera.fov / 360));
        camera.updateProjectionMatrix();

        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x87cefa, 1.0);
        renderer.setSize(width, height);
        element[0].appendChild(renderer.domElement);

        var trackball = new TrackballControls(camera, renderer.domElement);
        trackball.staticMoving = true;
        trackball.rotateSpeed = 3;
        trackball.radius = 500;
        trackball.target = target;

        render();

        $window.addEventListener('resize', () => {
          var width = element.width();
          var height = element.height();

          camera.aspect = width / height;
          camera.updateProjectionMatrix();

          renderer.setSize(width, height);
          renderer.render(scene, camera);
        });

        function render() {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
          trackball.update();
        }
      },
      restrict: 'E',
    };
  });

export default modName
