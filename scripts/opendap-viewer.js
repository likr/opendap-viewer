var $__src_95_opendap_45_viewer__ = (function() {
  "use strict";
  var __moduleName = "src_opendap-viewer";
  angular.module('opendap-viewer', ['ui.bootstrap', 'ngDragDrop']);
  angular.module('opendap-viewer').run((function($http, scene) {
    $http.get('data/map.json').success((function(data) {
      var geo = topojson.feature(data, data.objects.countries);
      var group = new THREE.Object3D();
      var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
      });
      geo.features.forEach((function(feature) {
        if (feature.geometry) {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach(addPath);
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((function(polygon) {
              polygon.forEach(addPath);
            }));
          }
        }
      }));
      scene.add(group);
      function addPath(coordinate) {
        var path = new THREE.Shape();
        path.moveTo(coordinate[0][0], coordinate[0][1]);
        for (var i = 1,
            n = coordinate.length; i < n; ++i) {
          path.lineTo(coordinate[i][0], coordinate[i][1]);
        }
        group.add(new THREE.Mesh(path.makeGeometry(), material));
      }
    }));
  }));
  return {};
})();

var $__src_95_services_47_camera__ = (function() {
  "use strict";
  var __moduleName = "src_services/camera";
  angular.module('opendap-viewer').factory('camera', (function() {
    var theta = 45;
    var camera = new THREE.PerspectiveCamera(theta, 1, 0.1, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  }));
  return {};
})();

var $__src_95_services_47_contour_45_geometry__ = (function() {
  "use strict";
  var __moduleName = "src_services/contour-geometry";
  angular.module('opendap-viewer').factory('ContourGeometry', (function() {
    return (($traceurRuntime.createClass)(function(plane, coordinates, ignoreValue) {
      THREE.Geometry.call(this);
      var nx = coordinates.x.length;
      var ny = coordinates.y.length;
      var extents = plane.map((function(row) {
        return d3.extent(row.filter((function(v) {
          return v !== ignoreValue;
        })));
      }));
      var min = d3.min(extents, (function(d) {
        return d[0];
      }));
      var max = d3.max(extents, (function(d) {
        return d[1];
      }));
      var scale = d3.scale.linear().domain([min, max]).range([240, 0]);
      var ix,
          iy;
      var vertexIndex = 0;
      for (iy = 0; iy < ny - 1; ++iy) {
        var y0 = coordinates.y[iy];
        var y1 = coordinates.y[iy + 1];
        for (ix = 0; ix < nx - 1; ++ix) {
          var x0 = coordinates.x[ix];
          var x1 = coordinates.x[ix + 1];
          this.vertices.push(new THREE.Vector3(x0, y0, -0.1));
          this.vertices.push(new THREE.Vector3(x1, y0, -0.1));
          this.vertices.push(new THREE.Vector3(x1, y1, -0.1));
          this.vertices.push(new THREE.Vector3(x0, y1, -0.1));
          var color0 = new THREE.Color(color(plane[iy][ix]));
          var color1 = new THREE.Color(color(plane[iy][ix + 1]));
          var color2 = new THREE.Color(color(plane[iy + 1][ix + 1]));
          var color3 = new THREE.Color(color(plane[iy + 1][ix]));
          var face1 = new THREE.Face3(vertexIndex, vertexIndex + 1, vertexIndex + 2);
          face1.vertexColors[0] = color0;
          face1.vertexColors[1] = color1;
          face1.vertexColors[2] = color2;
          this.faces.push(face1);
          var face2 = new THREE.Face3(vertexIndex, vertexIndex + 2, vertexIndex + 3);
          face2.vertexColors[0] = color0;
          face2.vertexColors[1] = color2;
          face2.vertexColors[2] = color3;
          this.faces.push(face2);
          vertexIndex += 4;
        }
      }
      function color(s) {
        if (s === ignoreValue || isNaN(s)) {
          return d3.hsl(0, 1, 1).toString();
        }
        return d3.hsl(scale(s), 1, 0.5).toString();
      }
    }, {}, {}, THREE.Geometry));
  }));
  return {};
})();

var $__src_95_services_47_isosurface_45_geometry__ = (function() {
  "use strict";
  var __moduleName = "src_services/isosurface-geometry";
  var edgeID = [[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1], [3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1], [3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1], [3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1], [9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1], [9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1], [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1], [8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1], [9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1], [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1], [3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1], [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1], [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1], [4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1], [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1], [5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1], [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1], [9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1], [0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1], [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1], [10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1], [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1], [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1], [5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1], [9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1], [0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1], [1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1], [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1], [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1], [2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1], [7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1], [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1], [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1], [11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1], [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1], [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1], [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1], [11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1], [1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1], [9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1], [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1], [2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1], [0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1], [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1], [6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1], [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1], [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1], [6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1], [5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1], [1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1], [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1], [6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1], [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1], [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1], [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1], [3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1], [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1], [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1], [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1], [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1], [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1], [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1], [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1], [10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1], [10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1], [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1], [1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1], [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1], [0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1], [10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1], [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1], [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1], [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1], [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1], [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1], [3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1], [6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1], [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1], [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1], [10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1], [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1], [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1], [7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1], [7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1], [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1], [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1], [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1], [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1], [0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1], [7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1], [10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1], [2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1], [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1], [7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1], [2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1], [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1], [10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1], [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1], [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1], [7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1], [6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1], [8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1], [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1], [6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1], [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1], [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1], [8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1], [0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1], [1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1], [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1], [10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1], [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1], [10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1], [5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1], [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1], [9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1], [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1], [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1], [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1], [7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1], [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1], [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1], [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1], [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1], [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1], [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1], [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1], [6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1], [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1], [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1], [6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1], [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1], [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1], [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1], [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1], [9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1], [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1], [1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1], [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1], [0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1], [5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1], [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1], [11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1], [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1], [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1], [2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1], [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1], [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1], [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1], [1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1], [9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1], [9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1], [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1], [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1], [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1], [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1], [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1], [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1], [9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1], [5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1], [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1], [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1], [8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1], [0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1], [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1], [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1], [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1], [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1], [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1], [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1], [11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1], [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1], [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1], [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1], [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1], [1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1], [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1], [4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1], [0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1], [3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1], [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1], [0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1], [9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1], [1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]];
  var vertexID = [[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 1, 0]], [[1, 1, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 0]], [[0, 0, 1], [1, 0, 1]], [[1, 0, 1], [1, 1, 1]], [[1, 1, 1], [0, 1, 1]], [[0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[1, 1, 0], [1, 1, 1]], [[0, 1, 0], [0, 1, 1]]];
  function mix(x, y, a) {
    return x * (1 - a) + y * a;
  }
  angular.module('opendap-viewer').factory('IsosurfaceGeometry', (function() {
    return (($traceurRuntime.createClass)(function(volume, coordinates, isovalue) {
      THREE.Geometry.call(this);
      var nx = coordinates.x.length;
      var ny = coordinates.y.length;
      var nz = coordinates.z.length;
      var vertexIndex = 0;
      var ix,
          iy,
          iz;
      for (iz = 0; iz < nz - 1; iz++) {
        var z0 = coordinates.z[iz];
        var z1 = coordinates.z[iz + 1];
        for (iy = 0; iy < ny - 1; iy++) {
          var y0 = coordinates.y[iy];
          var y1 = coordinates.y[iy + 1];
          for (ix = 0; ix < nx - 1; ix++) {
            var x0 = coordinates.x[ix];
            var x1 = coordinates.x[ix + 1];
            var index = table_index(ix, iy, iz);
            if (index === 0 || index === 255) {
              continue;
            }
            for (var j = 0; edgeID[index][j] != -1; j += 3) {
              var eid0 = edgeID[index][j];
              var eid1 = edgeID[index][j + 2];
              var eid2 = edgeID[index][j + 1];
              var vid = [vertexID[eid0][0], vertexID[eid0][1], vertexID[eid1][0], vertexID[eid1][1], vertexID[eid2][0], vertexID[eid2][1]];
              var v = vid.map((function(vidi) {
                return [vidi[0] ? ix + 1 : ix, vidi[1] ? iy + 1 : iy, vidi[2] ? iz + 1 : iz];
              }));
              var p = vid.map((function(vidi) {
                return [vidi[0] ? x1 : x0, vidi[1] ? y1 : y0, vidi[2] ? z1 : z0];
              }));
              this.vertices.push(interpolated_vertex(v[0], v[1], p[0], p[1], isovalue));
              this.vertices.push(interpolated_vertex(v[2], v[3], p[2], p[3], isovalue));
              this.vertices.push(interpolated_vertex(v[4], v[5], p[4], p[5], isovalue));
              this.faces.push(new THREE.Face3(vertexIndex, vertexIndex + 1, vertexIndex + 2));
              vertexIndex += 3;
            }
          }
        }
      }
      function table_index(i, j, k) {
        var s0 = volume[k][j][i];
        var s1 = volume[k][j][i + 1];
        var s2 = volume[k][j + 1][i + 1];
        var s3 = volume[k][j + 1][i];
        var s4 = volume[k + 1][j][i];
        var s5 = volume[k + 1][j][i + 1];
        var s6 = volume[k + 1][j + 1][i + 1];
        var s7 = volume[k + 1][j + 1][i];
        var index = 0;
        if (s0 > isovalue)
          index |= 1;
        if (s1 > isovalue)
          index |= 2;
        if (s2 > isovalue)
          index |= 4;
        if (s3 > isovalue)
          index |= 8;
        if (s4 > isovalue)
          index |= 16;
        if (s5 > isovalue)
          index |= 32;
        if (s6 > isovalue)
          index |= 64;
        if (s7 > isovalue)
          index |= 128;
        return index;
      }
      function interpolated_vertex(v0, v1, p0, p1, s) {
        var s0 = volume[v0[2]][v0[1]][v0[0]];
        var s1 = volume[v1[2]][v1[1]][v1[0]];
        var a = (s - s0) / (s1 - s0);
        var x = mix(p0[0], p1[0], a);
        var y = mix(p0[1], p1[1], a);
        var z = -mix(p0[2], p1[2], a) / 60;
        return new THREE.Vector3(x, y, z);
      }
    }, {}, {}, THREE.Geometry));
  }));
  return {};
})();

var $__src_95_services_47_jqdap__ = (function() {
  "use strict";
  var __moduleName = "src_services/jqdap";
  angular.module('opendap-viewer').factory('jqdap', (function($window, $q) {
    return {
      loadDataset: (function(url, options) {
        return $q.when($window.jqdap.loadDataset(url, options));
      }),
      loadData: (function(url, options) {
        return $q.when($window.jqdap.loadData(url, options));
      })
    };
  }));
  return {};
})();

var $__src_95_services_47_light__ = (function() {
  "use strict";
  var __moduleName = "src_services/light";
  angular.module('opendap-viewer').factory('light', (function() {
    var light = new THREE.DirectionalLight(new THREE.Color('white'));
    light.position.set(0, 0, 1);
    return light;
  }));
  return {};
})();

var $__src_95_services_47_objects__ = (function() {
  "use strict";
  var __moduleName = "src_services/objects";
  angular.module('opendap-viewer').factory('objects', (function() {
    return [];
  }));
  return {};
})();

var $__src_95_services_47_scene__ = (function() {
  "use strict";
  var __moduleName = "src_services/scene";
  angular.module('opendap-viewer').factory('scene', (function(light) {
    var scene = new THREE.Scene();
    scene.add(light);
    return scene;
  }));
  return {};
})();

var $__src_95_services_47_target__ = (function() {
  "use strict";
  var __moduleName = "src_services/target";
  angular.module('opendap-viewer').factory('target', (function() {
    return new THREE.Vector3();
  }));
  return {};
})();

var $__src_95_directives_47_camera_45_control__ = (function() {
  "use strict";
  var __moduleName = "src_directives/camera-control";
  angular.module('opendap-viewer').controller('CameraController', (($traceurRuntime.createClass)(function($scope, camera, target) {
    var $__0 = this;
    this.camera = camera;
    this.target = target;
    this.latFrom = -90;
    this.latTo = 90;
    this.lonFrom = -180;
    this.lonTo = 180;
    $scope.$watch((function() {
      return $__0.latFrom;
    }), (function(oldValue, newValue) {
      if (oldValue !== newValue) {
        $__0.resetCamera();
      }
    }));
    $scope.$watch((function() {
      return $__0.latTo;
    }), (function(oldValue, newValue) {
      if (oldValue !== newValue) {
        $__0.resetCamera();
      }
    }));
    $scope.$watch((function() {
      return $__0.lonFrom;
    }), (function(oldValue, newValue) {
      if (oldValue !== newValue) {
        $__0.resetCamera();
      }
    }));
    $scope.$watch((function() {
      return $__0.lonTo;
    }), (function(oldValue, newValue) {
      if (oldValue !== newValue) {
        $__0.resetCamera();
      }
    }));
  }, {resetCamera: function() {
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
    }}, {}))).directive('cameraControl', (function() {
    return {
      controller: 'CameraController as cameraCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/camera-control.html'
    };
  }));
  return {};
})();

var $__src_95_directives_47_control__ = (function() {
  "use strict";
  var __moduleName = "src_directives/control";
  angular.module('opendap-viewer').directive('control', (function() {
    return {
      restrict: 'E',
      templateUrl: 'partials/directives/control.html'
    };
  }));
  return {};
})();

var $__src_95_directives_47_datset_45_control__ = (function() {
  "use strict";
  var __moduleName = "src_directives/datset-control";
  function parseUrl(url) {
    var match = url.match(/(\w+):\/\/(\w+):(\w+)@(.+)/);
    if (match) {
      return {
        url: (match[1] + "://" + match[4]),
        username: match[2],
        password: match[3]
      };
    } else {
      return {url: url};
    }
  }
  function queryUrl(data) {
    var range = data.query.map((function(q) {
      return ("[" + q + "]");
    })).join('');
    return (data.url + ".dods?" + data.name + range);
  }
  function axisUrl(data, index) {
    return (data.url + ".dods?" + data.array.dimensions[index]);
  }
  function coordinates(data, dataset) {
    var result = new Set();
    data.array.dimensions.forEach((function(dimension) {
      var axis = dataset[dimension].attributes.axis;
      if (['X', 'Y', 'Z'].indexOf(axis) > -1) {
        result.add(axis);
      }
    }));
    return result;
  }
  angular.module('opendap-viewer').controller('DatasetController', (($traceurRuntime.createClass)(function($modal, jqdap, scene, objects, ContourGeometry, IsosurfaceGeometry) {
    this.$modal = $modal;
    this.jqdap = jqdap;
    this.scene = scene;
    this.objects = objects;
    this.ContourGeometry = ContourGeometry;
    this.IsosurfaceGeometry = IsosurfaceGeometry;
    this.grid = [];
    this.url = 'http://dias-tb2.tkl.iis.u-tokyo.ac.jp:10080/thredds/dodsC/DIAS/MOVE-RA2014';
  }, {
    loadDataset: function() {
      var $__0 = this;
      var url = this.url;
      this.requestDataset(url).then((function(dataset) {
        var key,
            data,
            axes;
        for (key in dataset) {
          data = dataset[key];
          if (data.type) {
            data.url = url;
            if (data.type === 'Grid') {
              $__0.grid.push(data);
              data.query = data.array.shape.map((function(shape, i) {
                return ("0:1:" + (shape - 1));
              }));
              axes = coordinates(data, dataset);
              data.draw = {
                contour2d: axes.size == 2,
                contour3d: axes.size == 3,
                isosurface: axes.size === 3,
                pbr: axes.size === 3
              };
            }
          }
        }
      }));
    },
    draw: function(data) {
      var url = queryUrl(data);
      console.log(url, data);
      this.requestData(url).then((function(data) {
        console.log(data);
      }));
    },
    drawContour2D: function(data) {
      var $__0 = this;
      var url = queryUrl(data);
      this.requestData(url).then((function(data) {
        var geometry = new $__0.ContourGeometry(data[0][0][0], {
          x: data[0][3],
          y: data[0][2]
        }, -9.989999710577421e+33);
        var material = new THREE.MeshBasicMaterial({
          vertexColors: THREE.VertexColors,
          side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        $__0.scene.add(mesh);
        $__0.objects.push({
          name: url,
          mesh: mesh,
          show: true
        });
      }));
    },
    drawContour3D: function(data) {
      var $__0 = this;
      var url = queryUrl(data);
      this.requestData(url).then((function(data) {
        var geometry = new $__0.ContourGeometry(data[0][0][0][0], {
          x: data[0][4],
          y: data[0][3]
        }, -9.989999710577421e+33);
        var material = new THREE.MeshBasicMaterial({
          vertexColors: THREE.VertexColors,
          side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        $__0.scene.add(mesh);
        $__0.objects.push({
          name: url,
          mesh: mesh,
          show: true
        });
      }));
    },
    drawIsosurface: function(data) {
      var $__0 = this;
      var url = queryUrl(data);
      this.$modal.open({
        controller: 'IsovalueDialogController as isovalueCtl',
        templateUrl: 'partials/dialogs/isovalue.html'
      }).result.then((function(result) {
        $__0.requestData(url).then((function(data) {
          var geometry = new $__0.IsosurfaceGeometry(data[0][0][0], {
            x: data[0][4],
            y: data[0][3],
            z: data[0][2]
          }, result.isovalue);
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          var material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(result.color),
            side: THREE.DoubleSide
          });
          var mesh = new THREE.Mesh(geometry, material);
          $__0.scene.add(mesh);
          $__0.objects.push({
            name: url,
            mesh: mesh,
            show: true
          });
        }));
      }));
    },
    inputQuery: function(data, index) {
      var $__0 = this;
      this.$modal.open({
        controller: 'QueryDialogController as queryCtl',
        resolve: {values: (function($q) {
            var deferred = $q.defer();
            $__0.requestData(axisUrl(data, index)).then((function(data) {
              deferred.resolve(data[0]);
            }));
            return deferred.promise;
          })},
        templateUrl: 'partials/dialogs/query.html'
      }).result.then((function(result) {
        data.query[index] = (result.from + ":" + result.step + ":" + result.to);
      }));
    },
    requestData: function(url) {
      var request = parseUrl(url);
      var options = {};
      if (request.username && request.password) {
        options.username = request.username;
        options.password = request.password;
      }
      return this.jqdap.loadData(request.url, options);
    },
    requestDataset: function(url) {
      var request = parseUrl(url);
      var options = {};
      if (request.username && request.password) {
        options.username = request.username;
        options.password = request.password;
      }
      return this.jqdap.loadDataset(request.url, options);
    }
  }, {}))).controller('IsovalueDialogController', (($traceurRuntime.createClass)(function($modalInstance) {
    this.$modalInstance = $modalInstance;
    this.isovalue = 34;
    this.color = '#ff0000';
  }, {
    ok: function() {
      this.$modalInstance.close({
        isovalue: +this.isovalue,
        color: this.color
      });
    },
    cancel: function() {
      this.$modalInstance.dismiss('cancel');
    }
  }, {}))).controller('QueryDialogController', (($traceurRuntime.createClass)(function($modalInstance, values) {
    this.$modalInstance = $modalInstance;
    this.values = values;
    this.from = values[0];
    this.to = values[values.length - 1];
    this.step = 1;
  }, {
    ok: function() {
      this.$modalInstance.close({
        from: this.values.indexOf(this.from),
        to: this.values.indexOf(this.to),
        step: this.step
      });
    },
    cancel: function() {
      this.$modalInstance.dismiss('cancel');
    }
  }, {}))).directive('datasetControl', (function() {
    return {
      controller: 'DatasetController as datasetCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/dataset-control.html'
    };
  }));
  return {};
})();

var $__src_95_directives_47_object_45_control__ = (function() {
  "use strict";
  var __moduleName = "src_directives/object-control";
  angular.module('opendap-viewer').controller('ObjectController', (($traceurRuntime.createClass)(function(scene, objects) {
    this.scene = scene;
    this.objects = objects;
  }, {toggle: function(object) {
      if (object.show) {
        this.scene.add(object.mesh);
      } else {
        this.scene.remove(object.mesh);
      }
    }}, {}))).directive('objectControl', (function() {
    return {
      controller: 'ObjectController as objectCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/object-control.html'
    };
  }));
  return {};
})();

var $__src_95_directives_47_screen__ = (function() {
  "use strict";
  var __moduleName = "src_directives/screen";
  angular.module('opendap-viewer').directive('screen', (function($window, jqdap, scene, camera, target) {
    return {
      link: (function(scope, element, attributes) {
        var width = element.width();
        var height = element.height();
        camera.aspect = width / height;
        camera.position.set(0, 0, Math.max(90, 180 / camera.aspect) / Math.tan(Math.PI * camera.fov / 360));
        camera.updateProjectionMatrix();
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x87cefa, 1.0);
        renderer.setSize(width, height);
        element[0].appendChild(renderer.domElement);
        var trackball = new THREE.TrackballControls(camera, renderer.domElement);
        trackball.staticMoving = true;
        trackball.rotateSpeed = 3;
        trackball.radius = 500;
        trackball.target = target;
        render();
        $($window).resize((function() {
          var width = element.width();
          var height = element.height();
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          renderer.render(scene, camera);
        }));
        function render() {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
          trackball.update();
        }
      }),
      restrict: 'E'
    };
  }));
  return {};
})();

var $__src_95_controllers_47_main__ = (function() {
  "use strict";
  var __moduleName = "src_controllers/main";
  angular.module('opendap-viewer').controller('MainController', (function() {
    var MainController = function MainController() {
      this.showControl = true;
      this.objects = [];
    };
    return ($traceurRuntime.createClass)(MainController, {toggleShowControl: function() {
        this.showControl = !this.showControl;
      }}, {});
  }()));
  return {};
})();
