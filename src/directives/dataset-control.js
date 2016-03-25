import angular from 'angular'
import THREE from 'three'

const is3D = (axes) => {
  return axes.length === (isTimeVarying(axes) ? 4 : 3);
};

const isTimeVarying = (axes) => {
  return axes.indexOf('time') >= 0;
};

const volumeAverage = (volume, ignoreValue) => {
  const nx = volume[0].length === 5 ? volume[0][4].length : volume[0][3].length;
  const ny = volume[0].length === 5 ? volume[0][3].length : volume[0][2].length;
  const nz = volume[0].length === 5 ? volume[0][2].length : volume[0][1].length;
  const data = volume[0].length === 5 ? volume[0][0][0] : volume[0][0];
  let val = 0;
  let count = 0;
  for (let z = 0; z < nz; ++z) {
    for (let y = 0; y < ny; ++y) {
      for (let x = 0; x < nx; ++x) {
        const value = data[z][y][x];
        if (value !== ignoreValue) {
          val += value;
          count += 1;
        }
      }
    }
  }
  return val / count;
};

const hasKey = (data, key) => {
  if (data.attributes.standard_name && data.attributes.standard_name.toLowerCase().startsWith(key)) {
    return true;
  }
  if (data.attributes.long_name && data.attributes.long_name.toLowerCase().startsWith(key)) {
    return true;
  }
  return false;
};

const depthConverter = (data) => {
  const sign = hasKey(data, 'depth') ? -1 : 1;
  const scale = hasKey(data, 'air_pressure') ? 1 / 6000 : 1 / 60;
  return (z) => sign * scale * z;
};

function parseUrl(url) {
  var match = url.match(/(\w+):\/\/(\w+):(\w+)@(.+)/);
  if (match) {
    return {
      url: `${match[1]}://${match[4]}`,
      username: match[2],
      password: match[3],
    };
  } else {
    return {
      url: url,
    };
  }
}


function queryUrl(data) {
  var range = data.query.map(q => `[${q}]`).join('');
  return `${data.url}.dods?${data.name}${range}`;
}


function axisUrl(data, index) {
  return `${data.url}.dods?${data.array.dimensions[index]}`;
}


function ignoreValue(data) {
  var value, key, keys = ['_FillValue', '_fillValue', 'missing_value'];
  for (key of keys) {
    if ((value = data.attributes[key]) !== undefined) {
      const buf = new Float32Array(1);
      buf[0] = value;
      return buf[0];
    }
  }
}

const modName = 'opendap-viewer.directives.dataset-control';

angular.module(modName, [])
  .controller('DatasetController', class {
    constructor($uibModal, jqdap, scene, objects, ContourGeometry, IsosurfaceGeometry) {
      this.$modal = $uibModal;
      this.jqdap = jqdap;
      this.scene = scene;
      this.objects = objects;
      this.ContourGeometry = ContourGeometry;
      this.IsosurfaceGeometry = IsosurfaceGeometry;
      this.grid = [];
      this.url = 'http://dias-tb2.tkl.iis.u-tokyo.ac.jp:10080/thredds/dodsC/DIAS/MOVE-RA2014';
    }

    loadDataset() {
      var url = this.url;
      this.requestDataset(url)
        .then(dataset => {
          var key, data, axes;
          for (key in dataset) {
            data = dataset[key];
            if (data.type) {
              data.url = url;
              if (data.type === 'Grid') {
                this.grid.push(data);
                data.query = data.array.shape.map((shape, i) => {
                  if (data.array.dimensions[i].toLowerCase() === 'time') {
                    return '0';
                  }
                  return `0:10:${shape - 1}`;
                });
                axes = data.array.dimensions;
                data.draw = {};
                if (isTimeVarying(axes)) {
                  if (is3D(axes)) {
                    data.draw.contour3DT = true;
                    data.draw.isosurface3DT = true;
                  } else {
                    data.draw.contour2DT = true;
                  }
                } else {
                  if (is3D(axes)) {
                    data.draw.contour3D = true;
                    data.draw.isosurface3D = true;
                  } else {
                    data.draw.contour2D = true;
                  }
                }
                data.x = dataset[data.array.dimensions[axes.length - 1]];
                data.y = dataset[data.array.dimensions[axes.length - 2]];
                data.z = dataset[data.array.dimensions[axes.length - 3]];
              }
            }
          }
        });
    }

    drawContour2D(data) {
      this.drawContour(data, (volume) => {
        return new this.ContourGeometry(volume[0][0], {
          x: volume[0][2],
          y: volume[0][1],
          z: 1,
        }, ignoreValue(data));
      });
    }

    drawContour2DT(data) {
      this.drawContour(data, (volume) => {
        return new this.ContourGeometry(volume[0][0][0], {
          x: volume[0][3],
          y: volume[0][2],
          z: 1,
        }, ignoreValue(data));
      });
    }

    drawContour3D(data) {
      this.drawContour(data, (volume) => {
        return new this.ContourGeometry(volume[0][0][0], {
          x: volume[0][3],
          y: volume[0][2],
          z: depthConverter(data.z)(volume[0][1][0]),
        }, ignoreValue(data));
      });
    }

    drawContour3DT(data) {
      this.drawContour(data, (volume) => {
        return new this.ContourGeometry(volume[0][0][0][0], {
          x: volume[0][4],
          y: volume[0][3],
          z: depthConverter(data.z)(volume[0][2][0]),
        }, ignoreValue(data));
      });
    }

    drawContour(data, f) {
      var url = queryUrl(data);
      this.$modal
        .open({
          controller: 'OpacityDialogController as opacityCtl',
          templateUrl:'partials/dialogs/opacity.html',
        })
        .result
        .then(result => {
          this.requestData(url)
            .then(volume => {
              var geometry = f(volume);
              var material = new THREE.MeshBasicMaterial({
                opacity: result.opacity,
                side: THREE.DoubleSide,
                transparent: true,
                vertexColors: THREE.VertexColors,
              });
              var mesh = new THREE.Mesh(geometry, material);
              this.scene.add(mesh);
              this.objects.push({
                name: url,
                mesh: mesh,
                show: true,
              });
            });
        });
    }

    drawIsosurface3D(data) {
      this.drawIsosurface(data, (volume, isovalue) => {
        return new this.IsosurfaceGeometry(volume[0][0], {
          x: volume[0][3],
          y: volume[0][2],
          z: volume[0][1].map(depthConverter(data.z)),
        }, isovalue);
      });
    }

    drawIsosurface3DT(data) {
      this.drawIsosurface(data, (volume, isovalue) => {
        return new this.IsosurfaceGeometry(volume[0][0][0], {
          x: volume[0][4],
          y: volume[0][3],
          z: volume[0][2].map(depthConverter(data.z)),
        }, isovalue);
      });
    }

    drawIsosurface(data, f) {
      var url = queryUrl(data);
      this.requestData(url)
        .then((volume) => {
          return this.$modal
            .open({
              controller: 'IsovalueDialogController as isovalueCtl',
              templateUrl: 'partials/dialogs/isovalue.html',
              resolve: {
                volume: () => volume,
                ignoreValue: () => ignoreValue(data),
              },
            })
            .result;
        })
        .then((result) => {
          var geometry = f(result.volume, result.isovalue);
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          var material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(result.color),
            side: THREE.DoubleSide,
          });
          var mesh = new THREE.Mesh(geometry, material);
          this.scene.add(mesh);
          this.objects.push({
            name: url,
            mesh: mesh,
            show: true,
          });
        });
    }

    inputQuery(data, index) {
      const resolve = {
        values: $q => {
          var deferred = $q.defer();
          this.requestData(axisUrl(data, index))
            .then(data => {
              deferred.resolve(data[0]);
            });
          return deferred.promise;
        },
      };
      if (data.array.dimensions[index].toLowerCase() === 'time') {
        this.$modal
          .open({
            controller: 'QuerySelectDialogController as queryCtl',
            templateUrl: 'partials/dialogs/query-select.html',
            resolve,
          })
          .result
          .then(result => {
            data.query[index] = result.index;
          });
      } else {
        this.$modal
          .open({
            controller: 'QueryDialogController as queryCtl',
            templateUrl: 'partials/dialogs/query.html',
            resolve,
          })
          .result
          .then(result => {
            data.query[index] = `${result.from}:${result.step}:${result.to}`;
          });
      }
    }

    requestData(url) {
      var request = parseUrl(url);
      var options = {};
      if (request.username && request.password) {
        options.username = request.username;
        options.password = request.password;
      }
      return this.jqdap.loadData(request.url, options);
    }

    requestDataset(url) {
      var request = parseUrl(url);
      var options = {};
      if (request.username && request.password) {
        options.username = request.username;
        options.password = request.password;
      }
      return this.jqdap.loadDataset(request.url, options);
    }
  })
  .controller('OpacityDialogController', class {
    constructor($uibModalInstance) {
      this.$modalInstance = $uibModalInstance;
      this.opacity = 0.5;
    }

    ok() {
      this.$modalInstance.close({
        opacity: +this.opacity,
      });
    }

    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  })
  .controller('IsovalueDialogController', class {
    constructor($uibModalInstance, volume, ignoreValue) {
      this.$modalInstance = $uibModalInstance;
      this.isovalue = volumeAverage(volume, ignoreValue);
      this.color = '#ff0000';
      this.volume = volume;
    }

    ok() {
      this.$modalInstance.close({
        isovalue: +this.isovalue,
        color: this.color,
        volume: this.volume,
      });
    }

    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  })
  .controller('QueryDialogController', class {
    constructor($uibModalInstance, values) {
      this.$modalInstance = $uibModalInstance;
      this.values = values;
      this.from = values[0];
      this.to = values[values.length - 1];
      this.step = 1;
    }

    ok() {
      this.$modalInstance.close({
        from: this.values.indexOf(this.from),
        to: this.values.indexOf(this.to),
        step: this.step,
      });
    }

    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  })
  .controller('QuerySelectDialogController', class {
    constructor($uibModalInstance, values) {
      this.$modalInstance = $uibModalInstance;
      this.values = values;
      this.index = values[0];
    }

    ok() {
      this.$modalInstance.close({
        index: this.values.indexOf(this.index),
      });
    }

    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  })
  .directive('datasetControl', () => {
    return {
      controller: 'DatasetController as datasetCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/dataset-control.html',
    };
  });

export default modName
