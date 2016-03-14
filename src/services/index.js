import angular from 'angular'
import cameraModule from './camera'
import contourGeometryModule from './contour-geometry'
import isosurfaceGeometryModule from './isosurface-geometry'
import jqdapModule from './jqdap'
import objectsModule from './objects'
import sceneModule from './scene'
import targetModule from './target'

const modName = 'opendap-viewer.services'

angular.module(modName, [
  cameraModule,
  contourGeometryModule,
  isosurfaceGeometryModule,
  jqdapModule,
  objectsModule,
  sceneModule,
  targetModule,
]);

export default modName
