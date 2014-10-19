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
    constructor($scope) {
      this.$scope = $scope;
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
  })
  .directive('datasetControl', () => {
    return {
      controller: 'DatasetController as datasetCtl',
      restrict: 'E',
      templateUrl: 'partials/directives/dataset-control.html',
    };
  });
