// 
// flowvis.js
// VF Data Loader for CSC544 Assignment 06
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the functions to load a vector field dataset
// encoded as a VTK .vti file



////////////////////////////////////////////////////////////////////////
// Function to initialize the volume renderer
//
// This function reads the contents of a .vti file and initializes a
// volume renderer.  The base transfer function is empty.

function parseVTKFile(fileContents){ 
  let reader = vtk.IO.XML.vtkXMLImageDataReader.newInstance();
  reader.parseAsArrayBuffer(fileContents);

  let imageData = reader.getOutputData();

  return new vfImageInterpolator(imageData);
}


class vfImageInterpolator {
  constructor(imageData) {
    this.imageData = imageData;
    this.dims = imageData.getDimensions();
    this.bounds = imageData.getBounds();
    this.extent = imageData.getExtent();
    this.vectorData = imageData.getPointData().getVectors();
    this.range = this.vectorData.getRange();

    console.log(this.bounds);
    console.log(this.extent);
  }


  interpolate(x,y) {
    let index = this.imageData.worldToIndex([x,y,0])
    let intIndex = index.map(x => Math.floor(x))
    
    //console.log(index)
    //console.log(intIndex)

    //check that the data point is within range
    if (intIndex[0] >= this.extent[0] && 
        intIndex[0] < this.extent[1] && 
        intIndex[1] >= this.extent[2] && 
        intIndex[1] < this.extent[3]) { 

      let i00 = (intIndex[0]+0-this.extent[0]) +
                (intIndex[1]+0-this.extent[2])*this.dims[0];
      let i01 = (intIndex[0]+0-this.extent[0]) +
                (intIndex[1]+1-this.extent[2])*this.dims[0];
      let i10 = (intIndex[0]+1-this.extent[0]) +
                (intIndex[1]+0-this.extent[2])*this.dims[0];
      let i11 = (intIndex[0]+1-this.extent[0]) +
                (intIndex[1]+1-this.extent[2])*this.dims[0];
      //console.log(i00,i01,i10,i11);
  
      //get the four data values
      let f00 = [this.vectorData.getComponent(i00,0), this.vectorData.getComponent(i00,1)]
      let f01 = [this.vectorData.getComponent(i01,0), this.vectorData.getComponent(i01,1)]
      let f10 = [this.vectorData.getComponent(i10,0), this.vectorData.getComponent(i10,1)]
      let f11 = [this.vectorData.getComponent(i11,0), this.vectorData.getComponent(i11,1)]
      //console.log(f00,f01,f10,f11);
  
      //compute weight factors for bilinear interpolation
      let a = index[0] - intIndex[0];
      let b = index[1] - intIndex[1];
      //console.log(a,b);
  
      //perform bilinear interpolation
      let fx = (f00[0]*(1-a) + f10[0]*a)*(1-b) + 
              (f10[0]*(1-a) + f11[0]*a)*b;
      let fy = (f00[1]*(1-a) + f10[1]*a)*(1-b) + 
              (f10[1]*(1-a) + f11[1]*a)*b;
  
      return [fx,fy];
    } else {
      //dataset is out of bounds
      //console.log("Accessing a position outside of the extent");
      return [0,0];
    }
  }
}

