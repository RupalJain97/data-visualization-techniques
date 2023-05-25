// 
// volren.js
// Volume Renderer for CSC544 Assignment 05
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the functions to create the vtk.js volume renderer
// canvas as well as to update its transfer functions
//
// It expects a div with id 'volren' to place the canvas
//


////////////////////////////////////////////////////////////////////////
// Global variables

var dimensions;
var scalarData = [];
var dataRange = [0,1];

var renderWindow;
var actor;
var ctfun;
var ofun;

////////////////////////////////////////////////////////////////////////
// Function to initialize the volume renderer
//
// This function reads the contents of a .vti file and initializes a
// volume renderer.  The base transfer function is empty.

function initializeVR(fileContents){ 
  let rootContainer = document.getElementById("volren");
  rootContainer.style.float = "left";
  rootContainer.style.width = "500px";
  rootContainer.style.height = "500px";

  while (rootContainer.children.length > 0) {
    rootContainer.children[0].remove();
  }

  let genericRenderWindow = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
  genericRenderWindow.setContainer(rootContainer);
  genericRenderWindow.setBackground([0,0,0]);
  genericRenderWindow.resize();

  let renderer = genericRenderWindow.getRenderer();
  renderWindow = genericRenderWindow.getRenderWindow();

  let reader = vtk.IO.XML.vtkXMLImageDataReader.newInstance();
  reader.parseAsArrayBuffer(fileContents);

  image = reader.getOutputData();
  dimensions = image.getDimensions();
  scalarData = image.getPointData().getScalars().getData();
  dataRange = image.getPointData().getScalars().getRange();


  actor = vtk.Rendering.Core.vtkVolume.newInstance();
  let mapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
  mapper.setSampleDistance(1);
  actor.setMapper(mapper);

  // create color and opacity transfer functions
  ctfun = vtk.Rendering.Core.vtkColorTransferFunction.newInstance();
  ofun = vtk.Common.DataModel.vtkPiecewiseFunction.newInstance();
  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  actor.getProperty().setScalarOpacityUnitDistance(0, 0.5);
  actor.getProperty().setInterpolationTypeToLinear();
  actor.getProperty().setUseGradientOpacity(0, true);
  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setShade(true);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);

  mapper.setInputConnection(reader.getOutputPort());

  renderer.addVolume(actor);

  let interactor = renderWindow.getInteractor();
  interactor.setDesiredUpdateRate(15.0);
  interactor.start();

  renderer.resetCamera();
  renderer.getActiveCamera().zoom(1.5);
  renderer.getActiveCamera().elevation(70);

  renderer.updateLightGeometry();
}



////////////////////////////////////////////////////////////////////////
// Function to update the volume renderer with new transfer function
//
// This function reads a list of color and opacity control points for
// the transfer function.  
//
// The optional third parameter "categorical" is used to specify whether
// or not the color transfer function should be interpretted as
// categorical.  When it is undefined or set to false, it will disable
// discrete transfer functions, but when set to true it will disable
// interpolation

function updateVR(colorPts, opacityPts, categorical) {
  ctfun.removeAllPoints();
  ofun.removeAllPoints();

  colorPts.forEach(function(c) { 
    ctfun.addRGBPoint(c[0], c[1].r/255.0, c[1].g/255.0, c[1].b/255.0);
  });

  if (categorical !== undefined) {
    if (categorical) {
      ctfun.setDiscretize(true);
      ctfun.setNumberOfValues(colorPts.length);
    } else {
      ctfun.setDiscretize(false);
    }
  }

  opacityPts.forEach(function(o) {
    ofun.addPoint(o[0], o[1]);
  });

  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  renderWindow.render();
}


