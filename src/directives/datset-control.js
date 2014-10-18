angular.module('opendap-viewer')
  .controller('DatasetController', class ControlController {

    constructor($scope) {
      this.$scope = $scope;
      this.dataset = [];
      this.url = 'http://localhost/dias/thredds/dodsC/DIAS/MOVE-RA2014';
    }

    loadDataset() {
      jqdap.loadDataset(this.url)
        .then(dataset => {
          var key, value;
          for (key in dataset) {
            value = dataset[key];
            if (value.type && value.type == 'Grid') {
              this.dataset.push(value);
            }
          }
          this.$scope.$apply();
        });
    }
  })
  .directive('datasetControl', () => {
    return {
      controller: 'DatasetController as ctl',
      restrict: 'E',
      templateUrl: 'partials/directives/dataset-control.html',
    };
  });
