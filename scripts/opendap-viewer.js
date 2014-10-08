var $__src_95_opendap_45_viewer__ = (function() {
  "use strict";
  var __moduleName = "src_opendap-viewer";
  angular.module('opendap-viewer', ['ui.router', 'ngDragDrop']);
  angular.module('opendap-viewer').config((function($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }));
  angular.module('opendap-viewer').run((function($http, scene) {
    $http.get('data/map.json').success((function(data) {
      var geo = topojson.feature(data, data.objects.countries);
      var group = new THREE.Object3D();
      var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      geo.features.forEach((function(feature) {
        if (feature.geometry) {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach(addPath);
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((function(polygon) {
              polygon.forEach(addPath);
            }));
          }
        }
      }));
      scene.add(group);
      function addPath(coordinate) {
        var path = new THREE.Shape();
        path.moveTo(coordinate[0][0], coordinate[0][1]);
        for (var i = 1,
            n = coordinate.length; i < n; ++i) {
          path.lineTo(coordinate[i][0], coordinate[i][1]);
        }
        group.add(new THREE.Mesh(path.makeGeometry(), material));
      }
    }));
  }));
  return {};
})();

var $__src_95_services_47_camera__ = (function() {
  "use strict";
  var __moduleName = "src_services/camera";
  angular.module('opendap-viewer').factory('camera', (function() {
    var camera = new THREE.OrthographicCamera(-180, 180, 180, -180, 1, 2);
    camera.position.set(0, 0, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  }));
  return {};
})();

var $__src_95_services_47_jqdap__ = (function() {
  "use strict";
  var __moduleName = "src_services/jqdap";
  angular.module('opendap-viewer').factory('jqdap', (function($window) {
    return $window.jqdap;
  }));
  return {};
})();

var $__src_95_services_47_scene__ = (function() {
  "use strict";
  var __moduleName = "src_services/scene";
  angular.module('opendap-viewer').service('scene', THREE.Scene);
  return {};
})();

var $__src_95_directives_47_control__ = (function() {
  "use strict";
  var __moduleName = "src_directives/control";
  var IGNORE_VALUE = -999000000;
  function createMesh(data) {
    var xList = data[0][4];
    var yList = data[0][3];
    var values = data[0][0][0][0];
    var f = Object;
    var geo = new THREE.Geometry();
    var i,
        cnt = 0;
    var _createTriagle = function(vList, cList) {
      for (i = 0; i < 3; i++) {
        geo.vertices.push(new THREE.Vector3(vList[i][0] >= 180 ? vList[i][0] - 360 : vList[i][0], vList[i][1], 0));
      }
      var vNum = 3 * cnt;
      geo.faces.push(new THREE.Face3(vNum, vNum + 1, vNum + 2));
      for (i = 0; i < 3; i++) {
        geo.faces[cnt].vertexColors[i] = new THREE.Color(cList[i]);
      }
      cnt++;
    };
    var _createSquare = function(vList, cList) {
      _createTriagle([vList[0], vList[1], vList[2]], [cList[0], cList[1], cList[2]]);
      _createTriagle([vList[0], vList[3], vList[2]], [cList[0], cList[3], cList[2]]);
    };
    var extents = values.map((function(row) {
      return d3.extent(row.filter((function(v) {
        return v != IGNORE_VALUE;
      })), f);
    }));
    var min = d3.min(extents, (function(d) {
      return d[0];
    }));
    var max = d3.max(extents, (function(d) {
      return d[1];
    }));
    var scale = d3.scale.linear().domain([min, max]).range([240, 0]);
    var _numTo16Color = function(num) {
      var v = f(num);
      if (num == IGNORE_VALUE || isNaN(v)) {
        return d3.hsl(0, 1, 1).toString();
      }
      return d3.hsl(scale(v), 1, 0.5).toString();
    };
    for (var xi = 0,
        xLen = xList.length - 1; xi < xLen; xi++) {
      for (var yi = 0,
          yLen = yList.length - 1; yi < yLen; yi++) {
        var vList = [[xList[xi], yList[yi]], [xList[xi + 1], yList[yi]], [xList[xi + 1], yList[yi + 1]], [xList[xi], yList[yi + 1]]];
        var cList = [_numTo16Color(values[yi][xi]), _numTo16Color(values[yi][xi + 1]), _numTo16Color(values[yi + 1][xi + 1]), _numTo16Color(values[yi + 1][xi])];
        _createSquare(vList, cList);
      }
    }
    var material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, material);
    return mesh;
  }
  angular.module('opendap-viewer').controller('ControlController', (function() {
    var ControlController = function ControlController($scope, scene, camera) {
      var $__0 = this;
      this.url = 'data/s.dods';
      this.scene = scene;
      this.camera = camera;
      this.latFrom = -90;
      this.latTo = 90;
      this.lonFrom = -180;
      this.lonTo = 180;
      $scope.$watch((function() {
        return $__0.latFrom;
      }), (function(oldValue, newValue) {
        if (oldValue !== newValue) {
          $__0.resetCamera();
        }
      }));
      $scope.$watch((function() {
        return $__0.latTo;
      }), (function(oldValue, newValue) {
        if (oldValue !== newValue) {
          $__0.resetCamera();
        }
      }));
      $scope.$watch((function() {
        return $__0.lonFrom;
      }), (function(oldValue, newValue) {
        if (oldValue !== newValue) {
          $__0.resetCamera();
        }
      }));
      $scope.$watch((function() {
        return $__0.lonTo;
      }), (function(oldValue, newValue) {
        if (oldValue !== newValue) {
          $__0.resetCamera();
        }
      }));
    };
    return ($traceurRuntime.createClass)(ControlController, {
      loadData: function() {
        var $__0 = this;
        jqdap.loadData(this.url).then((function(data) {
          $__0.scene.add(createMesh(data));
        }));
      },
      resetCamera: function() {
        var width = this.latTo - this.latFrom;
        var height = this.lonTo - this.lonFrom;
        var size = Math.max(width, height);
        var centerX = (this.lonTo + this.lonFrom) / 2;
        var centerY = (this.latTo + this.latFrom) / 2;
        this.camera.left = -size / 2;
        this.camera.right = size / 2;
        this.camera.top = size / 2;
        this.camera.bottom = -size / 2;
        this.camera.position.set(centerX, centerY, 1);
        this.camera.lookAt(new THREE.Vector3(centerX, centerY, 0));
        this.camera.updateProjectionMatrix();
      }
    }, {});
  }())).directive('control', (function() {
    return {
      controller: 'ControlController as ctl',
      restrict: 'E',
      templateUrl: 'partials/directives/control.html'
    };
  }));
  return {};
})();

var $__src_95_directives_47_screen__ = (function() {
  "use strict";
  var __moduleName = "src_directives/screen";
  angular.module('opendap-viewer').directive('screen', (function($window, jqdap, scene, camera) {
    return {
      link: (function(scope, element, attributes) {
        var width = element.width();
        var height = element.height();
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x0000ff, 1.0);
        renderer.setSize(width, height);
        element[0].appendChild(renderer.domElement);
        var render = (function() {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        });
        render();
        $($window).resize((function() {
          renderer.setSize(element.width(), element.height());
          renderer.render(scene, camera);
        }));
      }),
      restrict: 'E'
    };
  }));
  return {};
})();

var $__src_95_controllers_47_main__ = (function() {
  "use strict";
  var __moduleName = "src_controllers/main";
  angular.module('opendap-viewer').config((function($stateProvider) {
    $stateProvider.state('main', {
      controller: 'MainController as main',
      templateUrl: 'partials/controllers/main.html',
      url: '/'
    });
  })).controller('MainController', (function() {
    var MainController = function MainController(jqdap) {
      this.showControl = false;
    };
    return ($traceurRuntime.createClass)(MainController, {toggleShowControl: function() {
        this.showControl = !this.showControl;
      }}, {});
  }()));
  return {};
})();
