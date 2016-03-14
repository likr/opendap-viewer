import angular from 'angular'
import THREE from 'three'
import d3 from 'd3'

const modName = 'opendap-viewer.services.contour-geometry';

angular.module(modName, [])
  .factory('ContourGeometry', () => {
    return class extends THREE.Geometry {
      constructor(plane, coordinates, ignoreValue) {
        super();

        var nx = coordinates.x.length;
        var ny = coordinates.y.length;

        var extents = plane.map(row => {
          return d3.extent(row.filter(v => v !== ignoreValue));
        });
        var min = d3.min(extents, d => d[0]);
        var max = d3.max(extents, d => d[1]);
        var scale = d3.scale.linear()
          .domain([min, max])
          .range([240, 0]);

        var ix, iy;
        var vertexIndex = 0;
        for (iy = 0; iy < ny - 1; ++iy) {
          var y0 = coordinates.y[iy];
          var y1 = coordinates.y[iy + 1];
          for (ix = 0; ix < nx - 1; ++ix) {
            var x0 = coordinates.x[ix];
            var x1 = coordinates.x[ix + 1];
            this.vertices.push(new THREE.Vector3(x0, y0, coordinates.z));
            this.vertices.push(new THREE.Vector3(x1, y0, coordinates.z));
            this.vertices.push(new THREE.Vector3(x1, y1, coordinates.z));
            this.vertices.push(new THREE.Vector3(x0, y1, coordinates.z));
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
      }
    };
  });

export default modName
