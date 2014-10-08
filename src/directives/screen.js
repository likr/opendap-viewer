angular.module('opendap-viewer')
  .directive('screen', ($window, jqdap, scene, camera) => {
    return {
      link: (scope, element, attributes) => {
        var width = element.width();
        var height = element.height();
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x0000ff, 1.0);
        renderer.setSize(width, height);
        element[0].appendChild(renderer.domElement);

        var render = () => {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        };
        render();

        $($window).resize(() => {
          renderer.setSize(element.width(), element.height());
          renderer.render(scene, camera);
        });
      },
      restrict: 'E',
    };
  });
