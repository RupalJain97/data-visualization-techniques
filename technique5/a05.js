// 
// a05.js
// Template code for CSC544 Assignment 05
// Joshua A. Levine <josh@arizona.edu>
//
// This implements an editable transfer function to be used in concert
// with the volume renderer defined in volren.js
//
// It expects a div with id 'tfunc' to place the d3 transfer function
// editor
//

// 
// Modified a05.js
// CSC544 Assignment 05
// Rupal Jain <jainrupal@arizona.edu>
//
//

////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// Defining the padding and the x and y coordinates used in drag function.
var x, y = null;

// Pos is used to store the index of the circle currently selected for drag
var pos = null;

// ActiveButton is used to store the button currently selected
var ActiveButton = false;

// CurrentSelection is used to store the current color scale selected by the user and print it on the screen
var currentSelection = null;

// Defining the array for the control points
var points = [];

// Defining the color scale for the color bar, default selection is sequential 
let colorScaleBar;


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  svg = d3.select("#assign5").select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size)
    .style("border", "1px solid black")

  // Calling the function to draw the Line plot graph
  makePlot();

  //After initializing, set up anything that depends on the TF arrays
  updateTFunc();
}

// Call this function whenever a new dataset is loaded or whenever
// colorTF and opacityTF change

/**
 * This function is creating the color scale bar and opacity scale bar and changing the color of the circles based on the color scale selected by the user
 */
function updateTFunc() {
  //TODO: Write this

  // makePlot();
  /**
   * Ref: http://using-d3js.com/04_05_sequential_scales.html
   */
  // Setting the scale for the color
  let ColorBarwidth = svg.attr("width") - padding * 2;

  // Defining the color scale for the color bar based on the dataRange
  colorScaleBar2 = d3.scaleLinear()
    .domain([dataRange[0], dataRange[1]])
    .rangeRound([0, ColorBarwidth - 32]);

  // Appending the color bar on x-axis and filling the color using the colorTF array
  svg.append("g")
    .attr("transform", `translate(75, -20)`)
    .selectAll("rect")
    .data(colorTF)
    .enter()
    .append("rect")
    .attr("x", (d) => colorScaleBar2(d[0]))
    .attr("y", 475)
    .attr("height", 25)
    .attr("width", 34)
    .attr("fill", (d) => d[1]);

  // Below code will print axis labels on y axis
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 460)
    .attr("y", 495)
    .text("Color Transfer Function >>> ")
    .style("font-size", 16)
    .style("font-style", "italic")
    .style("font-weight", "bold")
    .style("fill", "#30127cb5");


  /**
   * Extra Feature: To know the intensity at the current position of the mouse, use the scale provide on the y-axis
   */
  // Setting the scale for the opacity
  const opacityColorScaleBar = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateGreys);

  // Defining the color scale for the opacity bar based on the domain [0,1]
  let OpacityScaleBar = d3.scaleLinear()
    .domain([0, 1])
    .rangeRound([0, ColorBarwidth - 32]);

  // Appending the color bar on y-axis and filling the color using the opacityTF array
  svg.append("g")
    .attr("transform", `translate(-460, 433) rotate(-90)`)
    .selectAll("rect")
    .data(colorTF)
    .enter()
    .append("rect")
    .attr("x", (d) => OpacityScaleBar(d[0]))
    .attr("y", 480)
    .attr("height", 25)
    .attr("width", 34)
    .attr("fill", (d) => opacityColorScaleBar(d[0]));

  // Below code will print axis labels on x axis
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", `rotate(-90)`)
    .attr("x", -50)
    .attr("y", 15)
    .text("Opacity Transfer Function >>> ")
    .style("font-size", 16)
    .style("fill", "#30127cb5")
    .style("font-style", "italic")
    .style("font-weight", "bold")


  /**
   * Extra feature: Color the circles in the line plot based on the position of the circle with respect to the x-axis
   */
  d3.selectAll('circle')
    .style('fill', function (d) {
      // Normalizing the index of the circle in points array with respect to the colorTF array length and rounding it to the nearest integer.
      let Circleposition = (points.indexOf(d) / (points.length) * colorTF.length);
      return colorTF[Math.round(Circleposition)][1];
    });
}


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

function makePlot() {
  /**
   * Ref: https://blocks.roadtolarissa.com/denisemauldin/538bfab8378ac9c3a32187b4d7aed2c2
   */

  // Defining the width and height of the svg containing the plot
  var width = +svg.attr("width") - padding * 2,
    height = +svg.attr("height") - padding * 2;

  // Setting the default values for the control points
  points = d3.range(11).map(function (i) {
    const x = (i * width) / 4 + (width / 4);
    // Will generate values between 0 and 1
    const y = i / 10;
    return [x, y];
  });

  // Setting the scale for the x and y axis
  x = d3.scaleLinear()
    .rangeRound([padding + 15, width + padding + 15]);

  y = d3.scaleLinear()
    .rangeRound([height + padding, padding])
    .domain([0, 1]);

  // Defining the x and y axis
  var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

  // Creating a line function to draw the line for each data point
  var line = d3.line()
    .x(function (d) { return x(d[0]); })
    .y(function (d) { return y(d[1]); });

  // Defining the drag function
  let drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

  // Defining the zoom function
  svg.append('rect')
    .attr('class', 'zoom')
    .attr('cursor', 'move')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', width)
    .attr('height', height)
    .attr('transform', `translate(${padding + 25},30)`)

  // Defining the groupp tag under the svg tag
  var focus = svg.append("g")
    .attr('width', width)
    .attr('height', height)
    .attr("transform", `translate(10, -${padding - 30})`);

  // Setting the domain of the x and y scale defined above
  x.domain(d3.extent(points, function (d) { return d[0]; }));
  y.domain(d3.extent(points, function (d) { return d[1]; }));

  // Creating the path line from the data points
  focus.append("path")
    .datum(points)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Creating the circles for the data points
  focus.selectAll('circle')
    .data(points)
    .enter()
    .append('circle')
    .attr('r', 5.0)
    .attr('cx', function (d) { return x(d[0]); })
    .attr('cy', function (d) { return y(d[1]); })
    .style('cursor', 'pointer')
    .style('fill', function (d) { return colorScaleBar(d[1]); });

  // Adding the drag function to the circles
  focus.selectAll('circle')
    .call(drag);

  // Creating the x and y axis
  focus.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0,${height + padding})`)
    .call(xAxis);

  focus.append('g')
    .attr('class', 'axis axis--y')
    .attr('transform', `translate(${padding + 15},0)`)
    .call(yAxis);

  // Defining the drag functions
  // dragstarted: When the drag starts the circle is raised and the class is set to active.
  function dragstarted(event, d) {
    d3.select(this).raise().classed('active', true);
  }

  // dragged: When the circle is dragged the x and y coordinates are updated and the path is redrawn.
  function dragged(event, d) {
    pos = points.indexOf(d);

    // If the point being dragged is an endpoint, only allow it to move up or down
    if (pos === 0 || pos === points.length - 1) {
      d[1] = y.invert(event.y);
      if (d[1] > 1) { d[1] = 1 }
      else if (d[1] < 0) {
        d[1] = 0;
      }
      // Update the position of the circle
      d3.select(this)
        .attr('cy', y(d[1]));
    }
    else {
      // Prevent the point from crossing the point before or after it in the curve
      const min_x = points[pos - 1][0];
      const max_x = points[pos + 1][0];
      const new_x = x.invert(event.x);
      if (new_x < min_x) {
        d[0] = min_x;
      }
      else if (new_x > max_x) {
        d[0] = max_x;
      }
      else {
        d[0] = new_x;
      }
      d[1] = y.invert(event.y);
      if (d[1] > 1) { d[1] = 1 }
      else if (d[1] < 0) {
        d[1] = 0;
      }

      // Update the position of the circle
      d3.select(this)
        .attr('cx', x(d[0]))
        .attr('cy', y(d[1]));
    }

    // Redraw the path lines in the graph
    focus.select('path')
      .attr('d', line);

    // Calling the function to update the opacity transfer function
    makeOpacity();

    updateVR(colorTF, opacityTF, ActiveButton);
  }

  // dragended: When the drag ends the class is set to inactive.
  function dragended(d) {
    d3.select(this).classed('active', false);
  }
}


////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input_a05.files.length > 0) {
    let file = input_a05.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function (e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();

      //update the TFs with the volren
      updateVR(colorTF, opacityTF, false);
    }

    // makePlot();
  }
}

/**
 * Main function to visualize the data
 */
function main_a05() {
  colorTF = [];
  opacityTF = [];

  size = 500;
  svg = null;

  padding = 50;
  x, y = null;

  pos = null;
  ActiveButton = false;
  currentSelection = null;
  points = [];

  colorScaleBar = d3.scaleSequential(d3.interpolateViridis)
    .domain([dataRange[0], dataRange[1]]);

  // Appending the text to display the current color scale selected by the user
  d3.select("#currentSelection")
    .style("font-size", 16)
    .style("font-style", "italic")
    .style("font-weight", "bold")
    // .style("color", "#ba1818");

  // To start, let's reset the TFs and then initialize the d3 SVG canvas
  // to draw the default transfer function
  resetTFs();
  initializeTFunc();
}

// Attach upload process to the loadData button
var input_a05 = document.getElementById("loadData");
input_a05.addEventListener("change", upload);

////////////////////////////////////////////////////////////////////////
// Functions to respond to buttons that switch color TFs

function resetTFs() {
  makeSequential();
  makeOpacity();
}

// Make a default opacity TF
function makeOpacity() {
  // Setting the opacity transfer function to the opacityTF variable
  opacityTF = points.map(d => [d[0], d[1]]);
}

// Make a sequential color TF
function makeSequential() {
  // Storing the current color scale selection in the currentSelection variable
  currentSelection = "Sequential";
  // Displaying the current color scale selection on the screen
  d3.select("#currentSelection").text("Current Selection: " + currentSelection);

  // Creating the color scale for Sequential color scale using interpolateViridis color scheme
  let colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([dataRange[0], dataRange[1]]);

  // Setting the colorscaleBar to the color scale on the x-axis
  colorScaleBar = d3.scaleSequential(d3.interpolateViridis)
    .domain([dataRange[0], dataRange[1]]);

  // Setting the color Transfer function to the colorTF variable
  colorTF = [];
  for (let i = 0; i < 13; i++) {
    // Generating the color values in the range of the dataRange
    val = dataRange[0] + (i * (dataRange[1] - dataRange[0]) / 12);
    colorTF.push([val, d3.rgb(colorScale(val))]);
  }
  return colorTF;
}

function makeDiverging() {
  // Storing the current color scale selection in the currentSelection variable
  currentSelection = "Diverging";
  // Displaying the current color scale selection on the screen
  d3.select("#currentSelection").text("Current Selection: " + currentSelection);

  // Creating the color scale for Diverging color scale using interpolatePiYG color scheme
  let colorScale = d3.scaleDiverging(d3.interpolatePiYG)
    .domain([dataRange[0], (dataRange[1] - dataRange[0]) / 2, dataRange[1]])

  // Setting the colorscaleBar to the color scale on the x-axis
  colorScaleBar = d3.scaleDiverging(d3.interpolatePiYG)
    .domain([dataRange[0], dataRange[1]]);

  // Setting the color Transfer function to the colorTF variable
  colorTF = [];
  for (let i = 0; i < 13; i++) {
    // Generating the color values in the range of the dataRange
    val = dataRange[0] + (i * (dataRange[1] - dataRange[0]) / 12);
    colorTF.push([val, d3.rgb(colorScale(val))]);
  }
  return colorTF;
}

function makeCategorical() {
  // Storing the current color scale selection in the currentSelection variable
  currentSelection = "Categorical";
  // Displaying the current color scale selection on the screen
  d3.select("#currentSelection").text("Current Selection: " + currentSelection);

  // Creating the domain array for the color scale and passing it to generate the colorTF below
  domainArr = [];
  for (let i = 0; i < 22; i++) {
    val = dataRange[0] + (i * (dataRange[1] - dataRange[0]) / 21);
    domainArr.push(val);
  }

  // Creating the color scale for Sequential color scale using interpolateViridis color scheme
  let colorScale = d3.scaleOrdinal()
    .domain(domainArr)
    .range(d3.schemeCategory10);

  // Setting the colorscaleBar to the color scale on the x-axis with domain of domainArr.
  colorScaleBar = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(domainArr);

  // Setting the color Transfer function to the colorTF variable
  colorTF = [];
  for (let i = 0; i < 22; i++) {
    // Generating the color values in the range of the dataRange
    val = dataRange[0] + (i * (dataRange[1] - dataRange[0]) / 21);
    colorTF.push([val, d3.rgb(colorScale(val))]);
  }
  return colorTF;
}

/**
 * Sequential: d3.interpolateViridis, d3.interpolatePlasma, d3.interpolateInferno, d3.interpolateMagma, d3.interpolateWarm, d3.interpolateCool, d3.interpolateCubehelixDefault, d3.interpolateBuGn, d3.interpolateBuPu, d3.interpolateGnBu, d3.interpolateOrRd, d3.interpolatePuBuGn, d3.interpolatePuBu, d3.interpolatePuRd, d3.interpolateRdPu, d3.interpolateYlGnBu, d3.interpolateYlGn, d3.interpolateYlOrBr, d3.interpolateYlOrRd.

Diverging: d3.interpolateBrBG, d3.interpolatePRGn, d3.interpolatePiYG, d3.interpolatePuOr, d3.interpolateRdBu, d3.interpolateRdGy, d3.interpolateRdYlBu, d3.interpolateRdYlGn, d3.interpolateSpectral.

Categorical: d3.schemeCategory10, d3.schemeCategory20, d3.schemeCategory20b, d3.schemeCategory20c, d3.schemeAccent, d3.schemeDark2, d3.schemePaired, d3.schemePastel1, d3.schemePastel2, d3.schemeSet1, d3.schemeSet2, d3.schemeSet3.

 */

// Adding event listeners to the buttons
// - Sequential
d3.select("#sequential").on("click", function () {
  ActiveButton = false;
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

// - Diverging
d3.select("#diverging").on("click", function () {
  ActiveButton = false;
  makeDiverging();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

// - Categorical
d3.select("#categorical").on("click", function () {
  ActiveButton = true;
  makeCategorical();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});
