import angular from 'angular'
import THREE from 'three'
import topojson from 'topojson'
import uiBootstrapModule from 'angular-ui-bootstrap'
import 'angular-dragdrop'
import mainControllerModule from './controllers/main'
import services from './services/index'
import directives from './directives/index'

angular.module('opendap-viewer', [uiBootstrapModule, 'ngDragDrop', mainControllerModule, services, directives]);

angular.module('opendap-viewer')
  .run(($http, scene) => {
    $http.get('data/map.json')
      .success(data => {
        var geo = topojson.feature(data, data.objects.countries);
        var group = new THREE.Object3D();
        var material = new THREE.MeshBasicMaterial({
          color: 0x206a3f,
          side: THREE.DoubleSide,
        });
        geo.features.forEach(feature => {
          if (feature.geometry) {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates.forEach(addPath);
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach(polygon => {
                polygon.forEach(addPath);
              });
            }
          }
        });
        scene.add(group);

        function addPath(coordinate) {
          var path = new THREE.Shape();
          path.moveTo(coordinate[0][0], coordinate[0][1]);
          for (var i = 1, n = coordinate.length; i < n; ++i) {
            path.lineTo(coordinate[i][0], coordinate[i][1]);
          }
          group.add(new THREE.Mesh(path.makeGeometry(), material));
        }
      });
  });
