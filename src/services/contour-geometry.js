import angular from 'angular'
import THREE from 'three'
import d3 from 'd3'

const modName = 'opendap-viewer.services.contour-geometry';

angular.module(modName, [])
  .factory('ContourGeometry', () => {
    return class extends THREE.Geometry {
      constructor(plane, coordinates, ignoreValue) {
        super();

        const nx = coordinates.x.length;
        const ny = coordinates.y.length;

        const extents = plane.map(row => {
          return d3.extent(row.filter(v => v !== ignoreValue));
        });
        const min = d3.min(extents, d => d[0]);
        const max = d3.max(extents, d => d[1]);
        const scale = d3.scale.linear()
          .domain([min, max])
          .range([240, 0]);
        const lonScale = (x) => x > 180 ? x - 360 : x;

        let vertexIndex = 0;
        for (let iy = 0; iy < ny - 1; ++iy) {
          const y0 = coordinates.y[iy];
          const y1 = coordinates.y[iy + 1];
          for (let ix = 0; ix < nx - 1; ++ix) {
            const x0 = lonScale(coordinates.x[ix]);
            const x1 = lonScale(coordinates.x[ix + 1]);
            if (x0 > x1) {
              continue;
            }
            this.vertices.push(new THREE.Vector3(x0, y0, coordinates.z));
            this.vertices.push(new THREE.Vector3(x1, y0, coordinates.z));
            this.vertices.push(new THREE.Vector3(x1, y1, coordinates.z));
            this.vertices.push(new THREE.Vector3(x0, y1, coordinates.z));
            const color0 = new THREE.Color(color(plane[iy][ix]));
            const color1 = new THREE.Color(color(plane[iy][ix + 1]));
            const color2 = new THREE.Color(color(plane[iy + 1][ix + 1]));
            const color3 = new THREE.Color(color(plane[iy + 1][ix]));
            const face1 = new THREE.Face3(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            face1.vertexColors[0] = color0;
            face1.vertexColors[1] = color1;
            face1.vertexColors[2] = color2;
            this.faces.push(face1);
            const face2 = new THREE.Face3(vertexIndex, vertexIndex + 2, vertexIndex + 3);
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
