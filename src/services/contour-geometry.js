import angular from 'angular'
import THREE from 'three'
import d3 from 'd3'

const extent3D = (volume, ignoreValue) => {
  const nx = volume[0][0].length;
  const ny = volume[0].length;
  const nz = volume.length;

  let min = Infinity;
  let max = -Infinity;

  for (let iz = 0; iz < nz; ++iz) {
    for (let iy = 0; iy < ny; ++iy) {
      for (let ix = 0; ix < nx; ++ix) {
        const value = volume[iz][iy][ix];
        if (value !== ignoreValue) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    }
  }

  return [min, max]
};

const modName = 'opendap-viewer.services.contour-geometry';

angular.module(modName, [])
  .factory('ContourGeometry', () => {
    return class extends THREE.Geometry {
      constructor(volume, coordinates, ignoreValue, dimension = 'xy') {
        super();

        const scale = d3.scale.linear()
          .domain(extent3D(volume, ignoreValue))
          .range([240, 0]);
        const color = (s) => {
          if (s === ignoreValue || isNaN(s)) {
            return d3.hsl(0, 1, 1).toString();
          }
          return d3.hsl(scale(s), 1, 0.5).toString();
        }
        const lonScale = (x) => x > 180 ? x - 360 : x;

        const nx = coordinates.x.length;
        const ny = coordinates.y.length;
        const nz = coordinates.z.length;
        let vertexIndex = 0;
        if (dimension === 'xz') {
          for (let iy = 0; iy < ny; ++iy) {
            const y = coordinates.y[iy];
            for (let iz = 0; iz < nz - 1; ++iz) {
              const z0 = coordinates.z[iz];
              const z1 = coordinates.z[iz + 1];
              for (let ix = 0; ix < nx - 1; ++ix) {
                const x0 = lonScale(coordinates.x[ix]);
                const x1 = lonScale(coordinates.x[ix + 1]);
                if (x0 > x1) {
                  continue;
                }
                this.vertices.push(new THREE.Vector3(x0, y, z0));
                this.vertices.push(new THREE.Vector3(x1, y, z0));
                this.vertices.push(new THREE.Vector3(x1, y, z1));
                this.vertices.push(new THREE.Vector3(x0, y, z1));
                const color0 = new THREE.Color(color(volume[iz][iy][ix]));
                const color1 = new THREE.Color(color(volume[iz][iy][ix + 1]));
                const color2 = new THREE.Color(color(volume[iz + 1][iy][ix + 1]));
                const color3 = new THREE.Color(color(volume[iz + 1][iy][ix]));
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
          }
        } else if (dimension === 'yz') {
          for (let ix = 0; ix < nx; ++ix) {
            const x = lonScale(coordinates.x[ix]);
            for (let iz = 0; iz < nz - 1; ++iz) {
              const z0 = coordinates.z[iz];
              const z1 = coordinates.z[iz + 1];
              for (let iy = 0; iy < ny - 1; ++iy) {
                const y0 = coordinates.y[iy];
                const y1 = coordinates.y[iy + 1];
                this.vertices.push(new THREE.Vector3(x, y0, z0));
                this.vertices.push(new THREE.Vector3(x, y1, z0));
                this.vertices.push(new THREE.Vector3(x, y1, z1));
                this.vertices.push(new THREE.Vector3(x, y0, z1));
                const color0 = new THREE.Color(color(volume[iz][iy][ix]));
                const color1 = new THREE.Color(color(volume[iz][iy + 1][ix]));
                const color2 = new THREE.Color(color(volume[iz + 1][iy + 1][ix]));
                const color3 = new THREE.Color(color(volume[iz + 1][iy][ix]));
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
          }
        } else {
          for (let iz = 0; iz < nz; ++iz) {
            const z = coordinates.z[iz];
            for (let iy = 0; iy < ny - 1; ++iy) {
              const y0 = coordinates.y[iy];
              const y1 = coordinates.y[iy + 1];
              for (let ix = 0; ix < nx - 1; ++ix) {
                const x0 = lonScale(coordinates.x[ix]);
                const x1 = lonScale(coordinates.x[ix + 1]);
                if (x0 > x1) {
                  continue;
                }
                this.vertices.push(new THREE.Vector3(x0, y0, z));
                this.vertices.push(new THREE.Vector3(x1, y0, z));
                this.vertices.push(new THREE.Vector3(x1, y1, z));
                this.vertices.push(new THREE.Vector3(x0, y1, z));
                const color0 = new THREE.Color(color(volume[iz][iy][ix]));
                const color1 = new THREE.Color(color(volume[iz][iy][ix + 1]));
                const color2 = new THREE.Color(color(volume[iz][iy + 1][ix + 1]));
                const color3 = new THREE.Color(color(volume[iz][iy + 1][ix]));
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
          }
        }
      }
    };
  });

export default modName
