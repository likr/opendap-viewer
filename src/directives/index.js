import angular from 'angular'
import screenModule from './screen'
import controlModule from './control'
import cameraControlModule from './camera-control'
import datasetControlModule from './dataset-control'
import objectControlModule from './object-control'

const modName = 'opendap-viewer.directives';

angular.module(modName, [
  screenModule,
  controlModule,
  cameraControlModule,
  datasetControlModule,
  objectControlModule,
]);

export default modName
