// 
// a06.js
// Skeleton code for CSC544 Assignment 06
// Joshua A. Levine <josh@arizona.edu>
//
// This implements vector field visualization techniques and relies on
// flowvis.js to perform the data loading of vector fields in VTK's .vti
// format.
//
// It expects a a div with id 'vfplot' to where the vector field will be
// visualized
//

// 
// Modified a05.js
// CSC544 Assignment 06
// Rupal Jain <jainrupal@arizona.edu>
//
//

////////////////////////////////////////////////////////////////////////
// Global variables and helper functions


//this variable will hold the vector field upon loading
let vf = null;

//variables for the svg canvas
svg = null;
width = 800;
height = 800;

// defining Padding
padding = 50;

// Defining the scales for the x and y axis, colorscale and magnitude scale
xScale = null;
yScale = null;
colorScale = null;
let magScale = null;

let flag = false;
////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeSVG() {
  //Since we will call this function multiple times, we'll clear out the
  //svg if it exists
  if (svg != null) {
    svg.remove()
  }

  //vf.bounds will report the units of the vector field
  //use aspect ratio to update width/height
  let aspectRatio = (vf.bounds[3] - vf.bounds[2]) / (vf.bounds[1] - vf.bounds[0]);
  height = width * aspectRatio;

  //Initialize the SVG canvas
  svg = d3.select("#vfplot")
    .append("svg")
    .attr("width", width).attr("height", height);

  // Scale for x-axis
  xScale = d3.scaleLinear()
    .domain([vf.bounds[0], vf.bounds[1]])
    .range([padding, width - padding]);

  // Scale for y-axis
  yScale = d3.scaleLinear()
    .domain([vf.bounds[2], vf.bounds[3]])
    .range([height - padding, padding]);

  //vf.range reports the minimum/maximum magnitude
  // Scale for color
  colorScale = d3.scaleSequential()
    .domain([vf.range[0], vf.range[1]])
    .interpolator(d3.interpolateInferno);

  // Scale for magnitude
  magScale = d3.scaleLinear()
    .domain(vf.range)
    .range([5, 45]);


  // Creating the axis for the vector field using x and y scales defined above
  svg.append("g")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(d3.axisBottom(xScale));
  svg.append("g")
    .attr("transform", `translate(${padding}, 0)`)
    .call(d3.axisLeft(yScale));


  // Taking the input from the user for the type of vector field (Glyphs and Streamlines) and the sedding position (Random and Uniform) using the dropdown menu
  const type = d3.select("#type").node();
  const seeding = d3.select("#seeding").node();

  // This is store the selected value in the vector field drop down
  const typetext = type.options[type.selectedIndex].text;

  // This is store the selected value in the seeding drop down
  const seedingtext = seeding.options[seeding.selectedIndex].text;

  // This is to set the selected value to the vector field drop down 
  d3.selectAll("#type option")
    .property("selected", function () {
      return this.text === typetext;
    });

  // This is to set the selected value to the seeding drop down
  d3.selectAll("#seeding option")
    .property("selected", function () {
      return this.text === seedingtext;
    });

  // Checking if the vector field selected is Glyphs or Streamlines and calling their respective function
  if (typetext == "Glyphs") {
    createGlyphs();
  }
  else if (typetext == "Streamline") {
    createStreamlines();
  }
  else {
    // Default vector field called when the page is loaded is Glyphs
    createGlyphs();
  }
}

/**
 * This function is generating the points based on the number of plot points for the x and y axis. The default value for Uniform and Random for Glyphs and Streamlines has been set in case there is no input provided by the user. 
 * 
 * EXTRA FUNCTIONALITY: The user can input the number of plot points for the x and y axis seperately in the table provided and the visualization will get updated.
 * 
 * @returns : Array of points for the seeding position
 * 
 */
function createPoints() {
  // Array to store the points
  var arrows = [];

  // Taking the input from the user for the type of vector field (Glyphs and Streamlines) and checking the sedding position (Random and Uniform) selected in the dropdown menu
  var type = document.getElementById("seeding").value;

  var numX, numY = null;

  if (type == "Uniform") {

    var type = document.getElementById("type").value;

    // If the vector field selected is Glyphs, then the default value for the number of plot points for the x and y axis is 30
    if (type == "Glyphs") {
      numX = document.getElementById("GlyphsNumX").value ? document.getElementById("GlyphsNumX").value : 30;
      numY = document.getElementById("GlyphsNumY").value ? document.getElementById("GlyphsNumY").value : 30;
    } else {
      // If the vector field selected is Streamlines, then the default value for the number of plot points for the x and y axis is 30
      numX = document.getElementById("StreamNumX").value ? document.getElementById("StreamNumX").value : 30;
      numY = document.getElementById("StreamNumY").value ? document.getElementById("StreamNumY").value : 30;
    }

    // Users needs to change the number of plot points for the x and y axis in the table provided to see the changes in the visualization
    // Calculating the threshold value for the x and y axis using bounds of the vector field
    var thresholdX = (vf.bounds[1] - vf.bounds[0]) / (numX);
    var thresholdY = (vf.bounds[3] - vf.bounds[2]) / (numY);
    for (var i = 0; i < numX; i++) {
      for (var j = 0; j < numY; j++) {
        // Calculating the plot points using the threshold value defined above and multiplying it with i and j to get all the points in the bound range.
        let x = vf.bounds[0] + thresholdX * i;
        let y = vf.bounds[2] + thresholdY * j;
        arrows.push([x, y]);
      }
    }
  } else {

    var type = document.getElementById("type").value;
    // If the vector field selected is Glyphs, then the default value for the number of plot points for the x and y axis is 100 and 10 respectively
    if (type == "Glyphs") {
      numX = document.getElementById("GlyphsRandNumX").value ? document.getElementById("GlyphsRandNumX").value : 100;
      numY = document.getElementById("GlyphsRandNumY").value ? document.getElementById("GlyphsRandNumY").value : 10;
    } else {
      // If the vector field selected is Streamlines, then the default value for the number of plot points for the x and y axis is 100 and 10 respectively
      numX = document.getElementById("StreamRandNumX").value ? document.getElementById("StreamRandNumX").value : 100;
      numY = document.getElementById("StreamRandNumY").value ? document.getElementById("StreamRandNumY").value : 10;
    }

    // Users needs to change the number of plot points for the x and y axis in the table provided to see the changes in the visualization
    // Calculating the threshold value for the x and y axis using bounds of the vector field
    var thresholdX = (vf.bounds[1] - vf.bounds[0]);
    var thresholdY = (vf.bounds[3] - vf.bounds[2]);

    for (var i = 0; i < numX; i++) {
      for (var j = 0; j < numY; j++) {
        // Calculating the plot points using the threshold value defined above and multiplying it with Math.random() to get all the points in the bound range randomly.
        let x = vf.bounds[0] + thresholdX * Math.random();
        let y = vf.bounds[2] + thresholdY * Math.random();
        arrows.push([x, y]);
      }
    }
  }

  // Returning the array of points generated
  return arrows;
}

/**
 * This function is to create the glyphs for the vector field. The glyphs are created using the points generated in the createPoints() function.
 * Procedure: 
 * 1. Generate the points using the createPoints() function.
 * 2. Calculate the threshold value for the x and y axis using the bounds of the vector field.
 * 3. FOr each point in arrows[], generate the vector points using the interpolate() function of the vector field.
 * 4. Calculate the magnitude, angle and color of the arrow.
 * 5. Define transformation and rotation of the arrow.
 * 6. Append the arrow to the svg and plot the points in thr svg
 * 
 */
function createGlyphs() {
  let glyphs = svg.append("g");

  // Generate the points using the createPoints() function
  arrows = createPoints();

  // Calculating the threshold value for the x and y axis using bounds of the vector field, 
  var type = document.getElementById("seeding").value;

  var numX, numY = null;
  if (type == "Random") {
    numX = document.getElementById("GlyphsRandNumX").value ? document.getElementById("GlyphsRandNumX").value : 100;
    numY = document.getElementById("GlyphsRandNumY").value ? document.getElementById("GlyphsRandNumY").value : 10;
  } else {
    // If the vector field selected is Streamlines, then the default value for the number of plot points for the x and y axis is 100 and 10 respectively
    numX = document.getElementById("GlyphsNumX").value ? document.getElementById("GlyphsNumX").value : 30;
    numY = document.getElementById("GlyphsNumY").value ? document.getElementById("GlyphsNumY").value : 30;
  }
  var thresholdX = (vf.bounds[1] - vf.bounds[0]) / numX;
  var thresholdY = (vf.bounds[3] - vf.bounds[2]) / numY;

  // For each point in arrows[], generate the vector points using the interpolate() function of the vector field and ploting the arrows in the svg following the steps mentioned above
  arrows.forEach((arrow) => {
    let x = arrow[0];
    let y = arrow[1];

    // Generate the vector points using the interpolate() function of the vector field
    let [vx, vy] = vf.interpolate(x + thresholdX / 2, y + thresholdY / 2);

    // Calculate the magnitude, angle and color of the arrow
    let magnitude = Math.sqrt(vx * vx + vy * vy);
    let angle = -(Math.atan2(vy, vx) * 180) / Math.PI;
    let color = colorScale(magnitude);

    // Define the dimensions of the arrow
    let height = magScale(magnitude);

    // the ratio of the width to the height in an equilateral triangle is sqrt(3)
    let width = height / Math.sqrt(3);

    let triangle = d3.symbol().type(d3.symbolTriangle);

    // Scale and translate the triangle to the correct position and size
    let transform = `translate(${xScale(x) + 10}, ${yScale(y) - 5})`;
    let rotate = `rotate(${angle - 90})`;

    // Set the size of the triangle
    triangle.size(height);

    // Get the path string representing the triangle symbol
    const pathString = triangle();

    // Parse the path string to extract the coordinates of the triangle
    const coordinates = pathString.match(/-?\d+\.?\d*/g).map(parseFloat);

    // The coordinates array will contain six numbers: x1, y1, x2, y2, x3, y3
    var [x1, y1, x2, y2, x3, y3] = coordinates;

    // Chaging the coordinates of the triangle to draw the arrow of fixed dimensions
    x2 = x1 + 2;
    x3 = x1 - 2;
    y1 = (height + 10) / 2;

    // Draw the arrow glyph using the values calculated above: tranform, rotate, height, angle, color
    glyphs.append("path")
      .attr("d", `M${x1},${y1}L${x2},${y2}L${x3},${y3}Z`)
      .attr("transform", `${transform} ${rotate}`)
      .style("fill", color)
      .text(`x: ${x} y:${y} Height: ${height} angle:${angle} ${-Math.atan2(vy, vx) * 180 / Math.PI} pos: ${coordinates}`);
  });
}

/**
 * 
 * This function implements Ranga Kutta 4th order integration method to integrate the vector field.
 * x(t) = x(t-dt) + 1/6 (k1 + 2k2 + 2k3 + k4)
 * k1 = dt * v(t-dt)
 * k2 = dt * v(x(t-dt) + k1/2) 
 * k3 = dt * v(x(t-dt) + k2/2)
 * k4 = dt * v(x(t-dt) + k3)
 * 
 * EXTRA FUNCTIONALITY: The user has been given the option to select the number of steps and delta t values to integrate the vector field.
 * 
 * @param {*} start : start position
 * @param {*} dt : the amount of time each step takes
 * @param {*} numSteps : the number of steps you will integrate.
 * @returns 
 * 
 */
function rk4Integrate(start, dt, numSteps) {
  let positions = [start];
  let [x, y] = start;

  for (let i = 0; i < numSteps; i++) {
    let [RK1x, RK1y] = vf.interpolate(x, y);
    if (RK1x === 0 && RK1y === 0)
      break;

    let [RK2x, RK2y] = vf.interpolate([x + RK1x * dt / 2, y + RK1y * dt / 2]);

    let [RK3x, RK3y] = vf.interpolate([x + RK2x * dt / 2, y + RK2y * dt / 2]);

    let [RK4x, RK4y] = vf.interpolate([x + RK3x * dt, y + RK3y * dt]);

    x = x + (RK1x + 2 * RK2x + 2 * RK3x + RK4x) * dt / 6;
    y = y + (RK1y + 2 * RK2y + 2 * RK3y + RK4y) * dt / 6;

    positions.push([x, y]);
  }

  // Return the positions of the streamline
  return positions;
}

/**
 * This function is to create the glyphs for the vector field. The glyphs are created using the points generated in the createPoints() function.
 * Procedure: 
 * 1. Generate the points using the createPoints() function.
 * 2. Calculate the max speed and domain width using vf range and bounds.
 * 3. Calculate dt and number of RK steps using the max speed and domain width.
 * 4. For each point in arrows[]. Integrate the vector field using the rk4Integrate() function.
 * 5. Draw the streamline using the drawStreamline() function.
 * 
 */
function createStreamlines() {
  let streamlines = svg.append("g");

  // Calculate the max speed and domain width using vf range and bounds
  let maxSpeed = vf.range[1] - vf.range[0];
  let domainWidth = vf.bounds[1] - vf.bounds[0];


  // Get the scaling factor from the user input, Default value provided is 10
  const seeding = d3.select("#seeding").property("value");
  let scalingFactor, dt, numSteps;

  if (seeding === "Uniform") {
    scalingFactor = d3.select("#scalingfactor").property("value");

    // Calculate dt and number of RK steps using the max speed and domain width
    if (d3.select("#dt").property("value")) {
      dt = d3.select("#dt").property("value");
    } else {
      dt = domainWidth / (maxSpeed * scalingFactor);
    }

    if (d3.select("#steps").property("value")) {
      numSteps = d3.select("#steps").property("value");
    } else {
      numSteps = Math.round(domainWidth / (maxSpeed * dt));
    }

    // Set the dt and number of RK steps in the table for the user to see and experiment using the values
    d3.select("#steps").property("value", numSteps);
    d3.select("#dt").property("value", dt);
  } else {
    scalingFactor = d3.select("#Randscalingfactor").property("value");

    // Calculate dt and number of RK steps using the max speed and domain width
    if (d3.select("#Randdt").property("value")) {
      dt = d3.select("#Randdt").property("value");
    } else {
      dt = domainWidth / (maxSpeed * scalingFactor);
    }

    if (d3.select("#Randsteps").property("value")) {
      numSteps = d3.select("#Randsteps").property("value");
    } else {
      numSteps = Math.round(domainWidth / (maxSpeed * dt));
    }

    // Set the dt and number of RK steps in the table for the user to see and experiment using the values
    d3.select("#Randsteps").property("value", numSteps);
    d3.select("#Randdt").property("value", dt);
  }


  // Set the maximum speed and domain width in the table for the user to see and experiment using the values
  d3.selectAll("#maxSpeed")
    .text(maxSpeed.toFixed(6));
  d3.selectAll("#domainWidth")
    .text(domainWidth.toFixed(2));

  // Create the points using the createPoints() function
  var arrows = createPoints();

  // For each point in arrows[]. Integrate the vector field using the rk4Integrate() function and plot the points in the svg following the steps provided above
  arrows.forEach((arrow, id) => {
    let x = arrow[0];
    let y = arrow[1];

    // Obtain the streamline points using the rk4Integrate() function
    var pos = rk4Integrate([x, y], dt, numSteps);

    // Scale the points using the scales defined for x and y axis which will be used to plot the streamline
    var position = pos.map(([x, y]) => [xScale(x), yScale(y)]);

    // Draw the streamline using the d3.line() function and passing the position obtained above
    var line = d3.line()(position);

    // Get the x and y components of the vector field at the point [x,y]
    let [vx, vy] = vf.interpolate(...arrow);

    // Calculate the magnitude, angle and color of the arrow
    let magnitude = Math.sqrt(vx * vx + vy * vy);
    let color = colorScale(magnitude);

    // Create a group for the line and arrowhead
    let lineGroup = streamlines.append("g");

    // Draw the streamline
    lineGroup.append("path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", magScale(magnitude) / 20)
      // arrowheadID is used to match the color of each triangle appended with the line
      .attr("marker-start", `url(#arrowhead${id})`);

    // Define arrowhead marker
    svg.append("defs")
      .append("marker")
      .attr("id", `arrowhead${id}`)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "5")
      .attr("refY", "5")
      .attr("markerWidth", "3")
      .attr("markerHeight", "3")
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", color)
      .attr("stroke", color);
  });
}

////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function (e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      vf = parseVTKFile(fileData);

      initializeSVG();
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", function () {
  document.getElementById("GlyphsNumX").value = "30";
  document.getElementById("GlyphsNumY").value = "30";
  document.getElementById("GlyphsRandNumX").value = "100";
  document.getElementById("GlyphsRandNumY").value = "10";
  document.getElementById("StreamNumX").value = "30";
  document.getElementById("StreamNumY").value = "30";
  document.getElementById("StreamRandNumX").value = "100";
  document.getElementById("StreamRandNumY").value = "10";
  document.getElementById("steps").value = "";
  document.getElementById("dt").value = "";
  document.getElementById("Randsteps").value = "";
  document.getElementById("Randdt").value = "";
  upload();
});


////////////////////////////////////////////////////////////////////////
// Functions to respond to selections

// Calling functions for each input provided by the user and calling initializeSVG() function to update the svg
var type = document.getElementById("type");
type.addEventListener("change", initializeSVG);

var seeding = document.getElementById("seeding");
seeding.addEventListener("change", initializeSVG);

var steps = document.getElementById("steps");
steps.addEventListener("change", function () {
  if (document.getElementById("type").value == "Streamline") {
    initializeSVG();
  }
});

var dt = document.getElementById("dt");
dt.addEventListener("change", function () {
  if (document.getElementById("type").value == "Streamline") {
    initializeSVG();
  }
});

var scalingfactor = document.getElementById("scalingfactor");
scalingfactor.addEventListener("change", function () {
  if (document.getElementById("type").value == "Streamline") {
    initializeSVG();
  }
});

var Randsteps = document.getElementById("Randsteps");
Randsteps.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var Randdt = document.getElementById("Randdt");
Randdt.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var Randscalingfactor = document.getElementById("Randscalingfactor");
Randscalingfactor.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var GlyphsNumX = document.getElementById("GlyphsNumX");
GlyphsNumX.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Uniform") {
    initializeSVG();
  }
});

var GlyphsNumY = document.getElementById("GlyphsNumY");
GlyphsNumY.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Uniform") {
    initializeSVG();
  }
});

var GlyphsRandNumX = document.getElementById("GlyphsRandNumX");
GlyphsRandNumX.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var GlyphsRandNumY = document.getElementById("GlyphsRandNumY");
GlyphsRandNumY.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var StreamNumX = document.getElementById("StreamNumX");
StreamNumX.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Uniform") {
    initializeSVG();
  }
});

var StreamNumY = document.getElementById("StreamNumY");
StreamNumY.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Uniform") {
    initializeSVG();
  }
});

var StreamRandNumX = document.getElementById("StreamRandNumX");
StreamRandNumX.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

var StreamRandNumY = document.getElementById("StreamRandNumY");
StreamRandNumY.addEventListener("change", function () {
  if (document.getElementById("seeding").value == "Random") {
    initializeSVG();
  }
});

/**
 * EXTRA FUNCTIONALITY: The reset button provided will set all the values to default in case the user wants to start over.
 */
d3.select("#reset")
  .on("click", function () {
    document.getElementById("scalingfactor").value = "10";
    document.getElementById("Randscalingfactor").value = "10";
    document.getElementById("GlyphsNumY").value = "30";
    document.getElementById("GlyphsRandNumX").value = "100";
    document.getElementById("GlyphsRandNumY").value = "10";
    document.getElementById("StreamNumX").value = "30";
    document.getElementById("StreamNumY").value = "30";
    document.getElementById("StreamRandNumX").value = "100";
    document.getElementById("StreamRandNumY").value = "10";
    document.getElementById("steps").value = "";
    document.getElementById("dt").value = "";
    document.getElementById("Randsteps").value = "";
    document.getElementById("Randdt").value = "";
    initializeSVG();
  });