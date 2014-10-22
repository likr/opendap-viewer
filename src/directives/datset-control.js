function parseUrl(url) {
  var match = url.match(/(\w+):\/\/(\w+):(\w+)@(.+)/);
  if (match) {
    return {
      url: `${match[1]}://${match[4]}`,
      username: match[2],
      password: match[3]
    };
  } else {
    return {
      url: url
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


function coordinates(data, dataset) {
  var result = new Set();
  data.array.dimensions.forEach(dimension => {
    var axis = dataset[dimension].attributes.axis;
    if (['X', 'Y', 'Z'].indexOf(axis) > -1) {
      result.add(axis);
    }
  });
  return result;
}


angular.module('opendap-viewer')
  .controller('DatasetController', class {
    constructor($modal, jqdap, scene, objects, ContourGeometry, IsosurfaceGeometry) {
      this.$modal = $modal;
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
                  return `0:1:${shape - 1}`;
                });
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
        });
    }

    draw(data) {
      var url = queryUrl(data);
      console.log(url, data);
      this.requestData(url)
        .then(data => {
          console.log(data);
        });
    }

    drawContour2D(data) {
      var url = queryUrl(data);
      this.requestData(url)
        .then(data => {
          var geometry = new this.ContourGeometry(data[0][0][0], {
            x: data[0][3],
            y: data[0][2]
          }, -9.989999710577421e+33);
          var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
          });
          var mesh = new THREE.Mesh(geometry, material);
          this.scene.add(mesh);
          this.objects.push({
            name: url,
            mesh: mesh,
            show: true
          });
        });
    }

    drawContour3D(data) {
      var url = queryUrl(data);
      this.requestData(url)
        .then(data => {
          var geometry = new this.ContourGeometry(data[0][0][0][0], {
            x: data[0][4],
            y: data[0][3]
          }, -9.989999710577421e+33);
          var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
          });
          var mesh = new THREE.Mesh(geometry, material);
          this.scene.add(mesh);
          this.objects.push({
            name: url,
            mesh: mesh,
            show: true
          });
        });
    }

    drawIsosurface(data) {
      var url = queryUrl(data);
      this.$modal
        .open({
          controller: 'IsovalueDialogController as isovalueCtl',
          templateUrl: 'partials/dialogs/isovalue.html',
        })
        .result
        .then(result => {
          this.requestData(url)
            .then(data => {
              var geometry = new this.IsosurfaceGeometry(data[0][0][0], {
                x: data[0][4],
                y: data[0][3],
                z: data[0][2],
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
                show: true
              });
            });
        });
    }

    inputQuery(data, index) {
      this.$modal
        .open({
          controller: 'QueryDialogController as queryCtl',
          resolve: {
            values: $q => {
              var deferred = $q.defer();
              this.requestData(axisUrl(data, index))
                .then(data => {
                  deferred.resolve(data[0]);
                });
              return deferred.promise;
            }
          },
          templateUrl: 'partials/dialogs/query.html',
        })
        .result
        .then(result => {
          data.query[index] = `${result.from}:${result.step}:${result.to}`;
        });
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
  .controller('IsovalueDialogController', class {
    constructor($modalInstance) {
      this.$modalInstance = $modalInstance;
      this.isovalue = 34;
      this.color = '#ff0000';
    }

    ok() {
      this.$modalInstance.close({
        isovalue: +this.isovalue,
        color: this.color,
      });
    }

    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  })
  .controller('QueryDialogController', class {
    constructor($modalInstance, values) {
      this.$modalInstance = $modalInstance;
      this.values = values;
      this.from = values[0];
      this.to = values[values.length - 1];
      this.step = 1;
    }

    ok() {
      this.$modalInstance.close({
        from: this.values.indexOf(this.from),
        to: this.values.indexOf(this.to),
        step: this.step
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
