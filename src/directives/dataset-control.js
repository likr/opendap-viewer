import angular from 'angular'
import THREE from 'three'

const modName = 'opendap-viewer.directives.dataset-control';

const volumeAverage = (volume, ignoreValue) => {
  const nx = volume[0][4].length;
  const ny = volume[0][3].length;
  const nz = volume[0][2].length;
  let val = 0;
  let count = 0;
  for (let z = 0; z < nz; ++z) {
    for (let y = 0; y < ny; ++y) {
      for (let x = 0; x < nx; ++x) {
        const value = volume[0][0][0][z][y][x];
        if (value !== ignoreValue) {
          val += value;
          count += 1;
        }
      }
    }
  }
  return val / count;
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


function depthConverter(data) {
  var sign = 1;
  var keys = ['depth'];

  for (const key of keys) {
    if (data.attributes.standard_name && data.attributes.standard_name.toLowerCase().startsWith(key)) {
      sign = -1;
      break;
    }
    if (data.attributes.long_name && data.attributes.long_name.toLowerCase().startsWith(key)) {
      sign = -1;
      break;
    }
  }
  return function(z) {
    return sign * z / 60;
  };
}


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
                data.draw = {
                  contour2d: axes.length === 3,
                  contour3d: axes.length === 4,
                  isosurface: axes.length === 4,
                };
                data.x = dataset[data.array.dimensions[axes.length - 1]];
                data.y = dataset[data.array.dimensions[axes.length - 2]];
                data.z = dataset[data.array.dimensions[axes.length - 3]];
              }
            }
          }
        });
    }

    drawContour2D(data) {
      var url = queryUrl(data);
      this.requestData(url)
        .then(volume => {
          var geometry = new this.ContourGeometry(volume[0][0][0], {
            x: volume[0][3],
            y: volume[0][2],
            z: -0.5,
          }, ignoreValue(data));
          var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors,
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

    drawContour3D(data) {
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
              var geometry = new this.ContourGeometry(volume[0][0][0][0], {
                x: volume[0][4],
                y: volume[0][3],
                z: depthConverter(data.z)(volume[0][2][0]),
              }, ignoreValue(data));
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

    drawIsosurface(data) {
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
          var geometry = new this.IsosurfaceGeometry(result.volume[0][0][0], {
            x: result.volume[0][4],
            y: result.volume[0][3],
            z: result.volume[0][2].map(depthConverter(data.z)),
          }, result.isovalue);
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
