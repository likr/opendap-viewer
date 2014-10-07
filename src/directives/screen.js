angular.module('opendap-viewer')
  .directive('screen', ($window, jqdap, scene, camera) => {
    var mercator = d3.geo.mercator()
      .rotate([225, 0, 0])
      .translate([472, 472]);
    var path = d3.geo.path()
      .projection(mercator);
    return {
      link: (scope, element, attributes) => {
        var width = element.width();
        var height = element.height();
        var renderer = new THREE.WebGLRenderer();
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
