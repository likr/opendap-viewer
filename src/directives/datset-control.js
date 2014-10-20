function queryUrl(data) {
  var range = data.query.map(q => `[${q}]`).join('');
  return `${data.url}.dods?${data.name}${range}`;
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
    constructor($scope, $modal, scene, IsosurfaceGeometry) {
      this.$scope = $scope;
      this.$modal = $modal;
      this.scene = scene;
      this.IsosurfaceGeometry = IsosurfaceGeometry;
      this.grid = [];
      this.url = 'http://localhost/dias/thredds/dodsC/DIAS/MOVE-RA2014';
    }

    loadDataset() {
      var url = this.url;
      jqdap.loadDataset(url)
        .then(dataset => {
          var key, data, axes;
          for (key in dataset) {
            data = dataset[key];
            if (data.type) {
              data.url = url;
              if (data.type === 'Grid') {
                this.grid.push(data);
                data.query = data.array.shape.map((shape, i) => {
                  return `0:${shape - 1}`;
                });
                axes = coordinates(data, dataset);
                data.draw = {
                  contour: axes.size >= 2,
                  isosurface: axes.size === 3,
                  pbr: axes.size === 3
                };
              }
            }
          }
          this.$scope.$apply();
        });
    }

    draw(data) {
      var url = queryUrl(data);
      console.log(url, data);
      jqdap.loadData(url)
        .then(data => {
          console.log(data);
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
          jqdap.loadData(url)
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
            });
        });
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
  .directive('datasetControl', () => {
    return {
      controller: 'DatasetController as datasetCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/dataset-control.html',
    };
  });
