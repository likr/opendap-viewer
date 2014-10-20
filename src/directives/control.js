var IGNORE_VALUE = -999000000;

function createMesh(data) {
  var xList = data[0][4];
  var yList = data[0][3];
  var values = data[0][0][0][0];
  var f = Object;

  var geo = new THREE.Geometry();

  var i, cnt = 0;
  var _createTriagle = function (vList, cList) {
    for (i = 0; i < 3; i++) {
      geo.vertices.push(new THREE.Vector3(
            vList[i][0] >= 180 ? vList[i][0] - 360 : vList[i][0],
            vList[i][1],
            0));
    }
    var vNum = 3 * cnt;
    geo.faces.push(new THREE.Face3(vNum, vNum + 1, vNum + 2));
    for (i = 0; i < 3; i++) {
      geo.faces[cnt].vertexColors[i] = new THREE.Color(cList[i]);
    }
    cnt++;
  };

  var _createSquare = function (vList, cList) {
    _createTriagle([vList[0], vList[1], vList[2]], [cList[0], cList[1], cList[2]]);
    _createTriagle([vList[0], vList[3], vList[2]], [cList[0], cList[3], cList[2]]);
  };

  // num to color
  var extents = values.map(row => {
    return d3.extent(row.filter(v => v != IGNORE_VALUE), f);
  });
  var min = d3.min(extents, d => d[0]);
  var max = d3.max(extents, d => d[1]);
  var scale = d3.scale.linear()
    .domain([min, max])
    .range([240, 0]);
  var _numTo16Color = function (num) {
    var v = f(num);
    if (num == IGNORE_VALUE || isNaN(v)){
      return d3.hsl(0, 1, 1).toString();
    }
    return d3.hsl(scale(v), 1, 0.5).toString();
  };

  for (var xi = 0, xLen = xList.length - 1; xi < xLen; xi++) {
    for (var yi = 0, yLen = yList.length - 1; yi < yLen; yi++) {
      var vList = [
        [xList[xi], yList[yi]],
        [xList[xi + 1], yList[yi]],
        [xList[xi + 1], yList[yi + 1]],
        [xList[xi], yList[yi + 1]]
          ];
      var cList = [
        _numTo16Color(values[yi][xi]),
        _numTo16Color(values[yi][xi + 1]),
        _numTo16Color(values[yi + 1][xi + 1]),
        _numTo16Color(values[yi + 1][xi])
          ];
      _createSquare(vList, cList);
    }
  }

  var material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
  });
  var mesh = new THREE.Mesh(geo, material);
  return mesh;
}

angular.module('opendap-viewer')
  .controller('ControlController', class ControlController {
    constructor($scope, scene, camera, target) {
      this.url = 'data/s.dods';
      this.scene = scene;
      this.camera = camera;
      this.target = target;
      this.latFrom = -90;
      this.latTo = 90;
      this.lonFrom = -180;
      this.lonTo = 180;

      $scope.$watch(() => this.latFrom, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.latTo, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.lonFrom, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
      $scope.$watch(() => this.lonTo, (oldValue, newValue) => {
        if (oldValue !== newValue) {
          this.resetCamera();
        }
      });
    }

    loadData() {
      jqdap.loadData(this.url)
        .then(data => {
          this.scene.add(createMesh(data));
        });
    }

    resetCamera() {
      var width = this.latTo - this.latFrom;
      var height = this.lonTo - this.lonFrom;
      var size = Math.max(width, height);
      var centerX = (this.lonTo + this.lonFrom) / 2;
      var centerY = (this.latTo + this.latFrom) / 2;
      var theta = this.camera.fov;
      this.camera.position.set(centerX, centerY, size / Math.tan(Math.PI * theta / 360));
      this.camera.lookAt(new THREE.Vector3(centerX, centerY, 0));
      this.camera.updateProjectionMatrix();
      this.target.set(centerX, centerY, 0);
    }
  })
  .directive('control', () => {
    return {
      controller: 'ControlController as ctl',
      restrict: 'E',
      templateUrl: 'partials/directives/control.html',
    };
  });
