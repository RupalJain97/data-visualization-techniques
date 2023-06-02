// 
// a03.js
// Template for CSC544 Assignment 03
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the template code for A03, providing a skeleton
// for how to initialize and draw the parallel coordinates plot  
//


// 
// Modified a03.js
// CSC544 Assignment 03
// Rupal Jain <jainrupal@arizona.edu>
//
//


////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 



// dims will store the seven numeric axes in left-to-right display order
let dims = [];

////////////////////////////////////////////////////////////////////////
// Global variables for the svg
/*
 Logic to plot a collection of svg elements given an input dataset in Brushable Scatterplot Matrix format
 Variables:
   width -> set width of the viewbox which is the main svg
   height -> set height of the viewbox which is the main svg
   padding -> setting the padding value for the viewbox which is the main svg
   svg -> global variable having the plot and the legend
*/



////////////////////////////////////////////////////////////////////////
// Initialize the x and y scales, axes, and brushes.  
//  - xScale stores a mapping from dimension id to x position
//  - yScales[] stores each y scale, one per dimension id
//  - axes[] stores each axis, one per id
//  - brushes[] stores each brush, one per id
//  - brushRanges[] stores each brush's event.selection, one per id

let colorScales = {};
let axes = {};
let brushRanges = {};

/**
 * Variables:
 * 
 *  div -> this variable creates a div tag that is used to display the name of the cars when hovering is done using mouse on the data lines.
 */
var div;
var currentColorScale = 0;

/** Creating a new div before pcplot to show the color legend */
let colorSVG;


/**
 * 
 * EXTRA FEATURE
 * 
 * Creating a drop down menu which will change the default color of the data lines based on the value selected in the drop down
 * 
 * Ref: https://d3-graph-gallery.com/graph/line_select.html
 * 
 */
var dropDown;
var options;


/**
 * 
 * EXTRA FEATURE:
 *  
 * Color Legend:
 * the legend will change with mouse over event and display the legend for the column on which mouse is hovered.
 * 
 * Ref: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
 * 
 */
function Legend_PC(dim) {

  colorSVG.append("text")
    .attr("transform", "translate(10,23)")
    .text(`The color Legend is based on the ${dim} column. Please select the attribute from the drop down menu to set the default`);

  colorSVG.append("text")
    .attr("transform", "translate(10,43)")
    .text(`color of the data lines.`);

  var sequentialScale = d3.scaleSequential()
    .domain(d3.extent(data, function (datum) { return datum[dim]; }))
    .range([height - padding, padding])
    .interpolator(d3.interpolateBrBG);

  colorSVG.append("g")
    .attr("class", "legendSequential")
    .attr("transform", "translate(10,55)");

  /** creating horizontal label and removing the decimals from the values */
  var legendSequential = d3.legendColor()
    .shapeWidth(50)
    .cells(8)
    .orient('horizontal')
    .scale(sequentialScale)
    .labelFormat(d3.format(".0f"));

  colorSVG.select(".legendSequential")
    .call(legendSequential);
}



/**
 * Main function to be called when user clicks on the Show button
 */
function main_a03() {
  data = cars;
  dims = Object.keys(data[0]).filter(d => typeof data[0][d] === "number");

  width = dims.length * 125;
  height = 500;
  padding = 50;

  svg = d3.select("#div1_a03")
    .attr("transform", "translate(0,100)")
    .append("svg")
    .attr("width", width).attr("height", height - 20)
    .attr("viewBox", [-5, 20, width, height - padding - 10]);

  xScale = d3.scalePoint()
    .domain(dims)
    .range([padding, width - padding]);

  yScales = {};
  colorScales = {};
  axes = {};
  brushes = {};
  brushRanges = {};


  div = d3.select("body").append("div")
    .attr("class", "tooltip-donut")
    .style("opacity", 0);
  currentColorScale = 0;

  /** Creating a new div before pcplot to show the color legend */
  colorSVG = d3.select("#assign3").select("#colorLegend")
    .append("svg")
    .attr("width", 870).attr("height", 100)
    .attr("id", "svgColorLegend")

  dropDown = d3.select("#assign3").select("#columns")
    .attr("class", "select")
    .attr("aria-label", "cars")
    .attr("name", "dims-list")
    .attr("width", 500).attr("height", 50)
    .attr("transform", "translate(50,50)")
    .attr("title", "cars")
    .on("change", function (d) {
      /**
       * Calling a helper function updateSelection to change the color legend and the color of the data lines
       */
      updateSelection();
    });

  options = dropDown.selectAll("myoption")
    .data(dims)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; });


  /** Calling the above functions to display the color dropdown and legend */
  Legend_PC(dims[currentColorScale]);

  // For each dimension, we will initialize a yScale, axis, brush, and
  // brushRange
  dims.forEach(function (dim) {
    //create a scale for each dimension
    yScales[dim] = d3.scaleLinear()
      .domain(d3.extent(data, function (datum) { return datum[dim]; }))
      .range([height - padding, padding]);


    //create a color scale for each dimension
    colorScales[dim] = d3.scaleSequential()
      .domain(d3.extent(data, function (datum) { return datum[dim]; }))
      .range([height - padding, padding])
      .interpolator(d3.interpolateBrBG);


    //set up a vertical axis for each dimensions
    axes[dim] = d3.axisLeft()
      .scale(yScales[dim])


    //set up brushes as a 20 pixel width band
    //we will use transforms to place them in the right location
    brushes[dim] = d3.brushY()
      .extent([
        [-10, padding],
        [10, height - padding]
      ])
      .on("start", updateBrush(dim));


    //brushes will be hooked up to their respective updateBrush functions
    brushes[dim]
      .on("brush", updateBrush(dim))
      .on("end", updateBrush(dim))

    //initial brush ranges to null
    brushRanges[dim] = null;
  });

  ////////////////////////////////////////////////////////////////////////
  // Make the parallel coordinates plots 

  // add the actual polylines for data elements, each with class "datapath"
  /** 
   * 
   * Creating the polylines under the class " datapath", using the xScale and yScale to map the x,y coordinates of a data element according to all the y axis.
   * 
   * Ref: https://observablehq.com/d/042834fb33485d09
   *      https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
   * 
   * 
   * EXTRA FEATURE:
   * 
   * Adding mouseover and mouseout functionality to display the name of the cars for each data element.
   * 
   * 
  */
  svg.append("g")
    .attr("class", "datalines")
    .selectAll(".datapath")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "datapath")
    .attr("d", d => d3.line()(dims.map(function (p) { return [xScale(p), yScales[p](d[p])]; })))
    .style("fill", "none")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))
    .style("opacity", 0.5)
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration('50');
      div.transition()
        .duration(50)
        .style("opacity", 1);
      div.html(i.name)
        .style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');
      div.transition()
        .duration('50')
        .style("opacity", 0);
    });


  // add the axis groups, each with class "axis"
  /** 
   * 
   * Creating the axis with the class "axis", using the xScale and axes objects. I have also given an unique ID to each axis. 
   * Appending a group tage with class "column_label" to combine the label and reordering buttons under one tag. 
   * Similarly defining the elements after and specifying the position, calling their respective onClick/mouseover/mouseleave functions. 
   * 
   * Ref: https://observablehq.com/d/042834fb33485d09
   *      https://observablehq.com/@julesblm/how-d3-symbol-works-by-someone-who-keeps-forgetting-how-it-wo
   *      https://htmldom.dev/swap-two-nodes/
  */
  svg.selectAll(".axis")
    .data(dims).enter()
    .append("g")
    .attr("class", "axis")
    .attr("id", function (d) {
      /** examples of ID: IDyear, IDcylinders, IDdisplacement, ID060... */
      return "ID" + d.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
    })
    .attr("transform", function (d) { return "translate(" + xScale(d) + ")"; })
    .each(function (d) { d3.select(this).call(axes[d]); });

  svg.selectAll(".axis")
    .append("g")
    .attr("class", "Column_label")
    /** Appending the label text tag */
    .append("text")
    .attr("class", "label");


  /**
   * 
   * EXTRA FEATURE:
   * 
   * Added mouseover functionality of the axis ticks as well. This means that whenever mouse is rolled over axis, it will bold the axis and its label and also display the color coding based on that particular column.
   * 
   * 
   */
  svg.selectAll(".tick")
    .on("mouseover", function (event, d) { return onMouseOver(event, d); })
    .on("mouseleave", function (event, d) { return onMouseExit(event, d); })

  // add the axes labels, each with class "label"
  /** 
   * 
   * Creating labels and adding events such as click, mouseover and mouseleave.
   * 
   * Note: The label is also having onClick functionality despite there are buttons present to move the column in either direction.
   * 
  */
  svg.selectAll(".label")
    .style("text-anchor", "middle")
    .attr("y", padding - 25)
    .text(function (d) { return d; })
    .style("fill", "black")
    .on("click", function (event, d) { return onClick(event, d); })
    .on("mouseover", function (event, d) { return onMouseOver(event, d); })
    .on("mouseleave", function (event, d) { return onMouseExit(event, d); })


  /**
   * 
   * EXTRA FEATURE
   * 
   * Adding 2 traingles which are used to reorder the column(y axis) of the plot. The left traingle is used to shift the column to the left and right traingle is used to shift the column to the right.
   * 
   * The feature can be seen by clicking on the traingles and the transition in the data lines changing would be seen. the data lines would get updated with respect to the column order of the y axis. For the last first column, the only option is to go on the right and for the last column, the only option is to go to the left.
   * 
   * Ref: https://htmldom.dev/swap-two-nodes/
   * 
   */
  svg.selectAll(".Column_label")
    .append("path")
    .attr("class", "left")
    .attr("d", d3.symbol().type(d3.symbolTriangle).size(30))
    .attr("transform", "translate(-8, 35) rotate(-90)")
    .on("click", function (event, d) { return onClick(event, d); })
    .each(function (d) {
      if (dims.indexOf(d) == 0) {
        d3.select(this).style("display", "none");
      }
    });
  svg.selectAll(".Column_label")
    .append("path")
    .attr("class", "right")
    .attr("d", d3.symbol().type(d3.symbolTriangle).size(30))
    .attr("transform", "translate(9, 35) rotate(90)")
    .on("click", function (event, d) { return onClick(event, d); })
    .each(function (d) {
      if (dims.indexOf(d) == dims.length - 1) {
        d3.select(this).style("display", "none");
      }
    });



  /////////////////////////////////////////////////////////////
  /***
   * 
   * EXTRA FEATURE
   * 
   * 
   * Inverted Axis: 
   * Added inverted axis feature on all the column, by appending 2 traingles below each y axis which are used to flip that axis.  
   * The upwards pointing traingle means that the ticks of the axis will be in increasing order starting from the top of the axis.
   * The downwards pointing traingle means that the ticks of the axis will be in decreasing order starting from the top of the axis.
   * 
   * A new group tag with class "flip" is appended to the axis class for each column. It is having a text tag and 2 path tags having the triangles
   * 
   * This can be seen by clicking on the traingles which will also change the data lines coordinates for that column. This transition is using a new helper function onClickAxisFlip(event, dim) defined further in the code, which is called on onClick event.
   * 
   */
  svg.selectAll(".axis")
    .append("g")
    .attr("class", "flip")
    .append("path")
    .attr("class", "increase")
    .attr("d", d3.symbol().type(d3.symbolTriangle).size(30))
    .attr("transform", "translate(-20, 468)")
    .on("click", function (d) {
      return onClickAxisFlip(event, d);
    });
  svg.selectAll(".flip")
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", height - 30)
    .text("Flip")
    .style("fill", "black");
  svg.selectAll(".flip")
    .append("path")
    .attr("class", "decrease")
    .attr("d", d3.symbol().type(d3.symbolTriangle).size(30))
    .attr("transform", "translate(21, 466) rotate(-180)")
    .on("click", function (d) {
      return onClickAxisFlip(event, d);
    });

  // add the brush groups, each with class ".brush" 
  /**
   * 
   * Creating brushes for each column having 20 pixels fixed width.
   * 
   * 
   */
  svg.selectAll(".brush")
    .data(dims).enter()
    .append("g")
    .attr("class", "brushing")
    .attr("id", function (d) {
      /** examples of ID: IDyear, IDcylinders, IDdisplacement, ID060... */
      return "BrushID" + d.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
    })
    .append("g")
    .attr("class", "brush")
    .attr("transform", function (d) { return "translate(" + xScale(d) + ")"; })
    .each(function (d) { d3.select(this).call(brushes[d]); })

  /**
   * Added a not regarding the flip feature
   */
  d3.select("#pcplot").append("br");
  d3.select("#pcplot")
    .append("g")
    .attr("id", "note")
    .append("text")
    .style("text-anchor", "left")
    .text("*Note: Arrow pointing upwards means increasing order of the ticks in axis starting from top. And vica versa for arrow pointing downwards. The color of the data lines will reflect the color according to the column selected but will soon turned back the orginal color due to transitions.")
    .style("fill", "black")
    .style("font-size", 14)

}

////////////////////////////////////////////////////////////////////////
// Interaction Callbacks

// Callback for swaping axes when a text label is clicked.
function onClick(event, dim) {

  /**
   * 
   * Helper functions to swap the 2 y-axis
   * 
   * Ref: https://htmldom.dev/swap-two-nodes/
   * 
   */
  const swapLeft = function () {
    /**
     * nodeA -> stores the current active axis
     * nodeB -> store the next sibling of the current axis
     */
    var nodeA = event.srcElement.parentElement.parentNode;
    var nodeB = event.srcElement.parentElement.parentNode.previousElementSibling;

    /**
     * Swapping the transformation of both the axes
     */
    var temp = d3.select(nodeA)._groups[0][0].attributes.transform.value;

    d3.select(nodeA)._groups[0][0].attributes.transform.value = d3.select(nodeB)._groups[0][0].attributes.transform.value;

    d3.select(nodeB)._groups[0][0].attributes.transform.value = temp;

    /**
     * Move `nodeA` to before the `nodeB`
     *  
     */
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    /**
     * Swapping Brushes
     * nodeA -> stores the current active axis
     * nodeB -> store the next sibling of the current axis
     */
    id = "#BrushID" + dim.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
    nodeA = d3.select(id)._groups[0][0];
    nodeB = d3.select(id)._groups[0][0].previousElementSibling;

    /**
     * Swapping the transformation of both the axes
     */

    var temp = nodeA.children[0].attributes.transform.value;

    nodeA.children[0].attributes.transform.value = nodeB.children[0].attributes.transform.value;

    nodeB.children[0].attributes.transform.value = temp;

    /**
     * Move `nodeB` to before the `nodeA`
     *  
     */
    nodeB.parentNode.insertBefore(nodeA, nodeB);
  };

  const swapRight = function () {
    /**
     * nodeA -> stores the current active axis
     * nodeB -> store the next sibling of the current axis
     */
    var nodeA = event.srcElement.parentElement.parentNode;
    var nodeB = event.srcElement.parentElement.parentNode.nextElementSibling;

    /**
     * Swapping the transformation of both the axes
     */
    var temp = d3.select(nodeA)._groups[0][0].attributes.transform.value;

    d3.select(nodeA)._groups[0][0].attributes.transform.value = d3.select(nodeB)._groups[0][0].attributes.transform.value;

    d3.select(nodeB)._groups[0][0].attributes.transform.value = temp;

    /**
     * Move `nodeB` to before the `nodeA`
     *  
     */
    nodeA.parentNode.insertBefore(nodeB, nodeA);


    /**
     * Swapping Brushes
     * nodeA -> stores the current active axis
     * nodeB -> store the next sibling of the current axis
     */
    id = "#BrushID" + dim.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
    nodeA = d3.select(id)._groups[0][0];
    nodeB = d3.select(id)._groups[0][0].nextElementSibling;

    /**
     * Swapping the transformation of both the axes
     */

    var temp = nodeA.children[0].attributes.transform.value;

    nodeA.children[0].attributes.transform.value = nodeB.children[0].attributes.transform.value;

    nodeB.children[0].attributes.transform.value = temp;

    /**
     * Move `nodeB` to before the `nodeA`
     *  
     */
    nodeA.parentNode.insertBefore(nodeB, nodeA);
  };

  /**
   * Below if else is used to check for the direction in which user wants to shift the column, based on the direction, the column will be shifted and datalines will get updated.
   * 
   * Swapping the column based on the index in dims variable and then swapping the elements in html
   * 
   */
  if (event.target.classList[0] == "left") {
    /**
     *  Updating dims by swapping the position of the 2 y-axis.
     */
    var element = dims[dims.indexOf(dim)];
    var index = dims.indexOf(dim);
    dims[index] = dims[index - 1];
    dims[index - 1] = element;

    /** 
     * Calling the helper functions to swap the html element now
     */
    swapLeft();

  } else if (event.target.classList[0] == "right") {
    /**
     *  Updating dims by swapping the position of the 2 y-axis.
     */
    var element = dims[dims.indexOf(dim)];
    var index = dims.indexOf(dim);
    dims[index] = dims[index + 1];
    dims[index + 1] = element;

    /** 
     * Calling the helper functions to swap the html element now
     */
    swapRight();

  } else {
    if (dims.indexOf(dim) == dims.length - 1) {
      /**
       *  Updating dims by swapping the position of the 2 y-axis.
       */
      var element = dims[dims.indexOf(dim)];
      var index = dims.indexOf(dim);
      dims[index] = dims[index - 1];
      dims[index - 1] = element;

      /** 
       * Calling the helper functions to swap the html element now
       */
      swapLeft();

    } else {
      /**
       *  Updating dims by swapping the position of the 2 y-axis.
       */
      var element = dims[dims.indexOf(dim)];
      var index = dims.indexOf(dim);
      dims[index] = dims[index + 1];
      dims[index + 1] = element;

      /** 
       * Calling the helper functions to swap the html element now
       */
      swapRight();

    }
  }

  /** 
   * Setting the xScale based on the updated dims object
   * 
   */
  xScale = d3.scalePoint()
    .domain(dims)
    .range([padding, width - padding]);

  /**
   * 
   * Updating the display settings of the reorder traingles (left & right) in the label tag acocoring the updated dims object
   * 
   */
  svg.selectAll(".left")
    .on("click", function (event, d) { return onClick(event, d); })
    .each(function (d) {
      if (dims.indexOf(d) == 0) {
        d3.select(this).style("display", "none");
      } else {
        d3.select(this).style("display", "");
      }
    });
  svg.selectAll(".right")
    .on("click", function (event, d) { return onClick(event, d); })
    .each(function (d) {
      if (dims.indexOf(d) == dims.length - 1) {
        d3.select(this).style("display", "none");
      } else {
        d3.select(this).style("display", "");
      }
    });

  /** 
   * Updating the data lines based on the updated axes and dims in the Parallel Coordinates plot
   */
  svg.transition().duration(1000)
    .select(".datalines")
    .selectAll(".datapath")
    .attr("d", d => d3.line()(dims.map(function (p) { return [xScale(p), yScales[p](d[p])]; })))
    .style("fill", "none")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))
    .style("opacity", 0.5)

  svg.transition().duration(1005)
    .on("end", function () { onBrush() })

  /**
   * Updating the color encoding default selection.
   */
  options.property("selected", function (d) { return d === dims[0]; });
  currentColorScale = 0;

  /**
   * Removing the color legend and rebuilding it again by calling the Legend_PC() function
   */
  d3.select("#svgColorLegend").html(null);
  Legend_PC(dims[0]);
}


/**
 * 
 * Helper function for Inverting Axes
 * 
 * Logic: It will fetch the class name from the event to check the requested orientation of the y-axis such as display increasing order or decreasing order of ticks starting from top. 
 * Based on the order, the axis will be flipped if required and the data lines will get updated.
 * 
 * The transition can be seen by clicking on the 2 traingles side to the flip word under each y-axis. The left traingle flips the axis to increasing order of the ticks and right triangle flips the axis to decreasing odrder of the ticks.
 * 
 */
function onClickAxisFlip(event, dim) {

  /**
   * x -> stores the column name
   */
  x = dim.target.__data__;

  /**
   * Below is setting yScale based on the requested direction of the flip
   */
  if (dim.target.classList[0] == "increase") {
    yScales[x] = d3.scaleLinear()
      .domain(d3.extent(data, function (datum) { return datum[x]; }))
      .range([padding, height - padding]);
  } else {
    yScales[x] = d3.scaleLinear()
      .domain(d3.extent(data, function (datum) { return datum[x]; }))
      .range([height - padding, padding]);
  }

  /**
   * Setting the axes of the active column based on the requested direction of the flip
   */
  axes[x] = d3.axisLeft()
    .scale(yScales[x])

  /**
   * id -> it stores the unique id of each axis, which is then passed for updating the domain of that column
   */
  id = "#ID" + x.split(' ')[0].replace(/[^A-Z0-9]/ig, "");

  /**
   * Updating the ticks of the axis based on the updated domain
   */
  svg.select(id)
    .each(function (d) { d3.select(this).call(axes[d]); })

  /** 
   * Updating the data lines based on the updated axes and dims in the Parallel Coordinates plot
   */
  svg.transition().duration(1000)
    .select(".datalines")
    .selectAll(".datapath")
    .attr("d", d => d3.line()(dims.map(function (p) { return [xScale(p), yScales[p](d[p])]; })))
    .style("fill", "none")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))
    .style("opacity", 0.5)

  svg.transition().duration(1000)
    .on("end", function () { onBrush() })

}


function onMouseOver(event, dim) {

  /**
  * x -> stores the column name
  */
  x = "";
  if (event.target.className.baseVal == "") {
    x = event.srcElement.parentElement.parentElement.__data__;
  } else {
    x = event.target.__data__;
  }

  /**
   * Removing the color legend and rebuilding it again by calling the Legend_PC() function
   */
  d3.select("#svgColorLegend").html(null);
  Legend_PC(x);

  /** 
   * Updating the data lines based on the updated axes and dims in the Parallel Coordinates plot
   */
  d3.selectAll(".datapath")
    .style("stroke", d => colorScales[x](d[x]))

  /**
   * Making all the text of the active column as Bold and increasing the font-size
   * 
   * id -> it stores the unique id of each axis, which is then passed styling the active column
   * examples of ID: IDyear, IDcylinders, IDdisplacement, ID060...
   * 
   */
  id = "#ID" + x.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
  d3.select(id)
    .selectAll("text")
    .transition().duration(100)
    .style("font-weight", "bolder")
    .style("font-size", "12px");
}

function onMouseExit(event, dim) {

  /**
  * x -> stores the column name
  */
  x = "";
  if (event.target.className.baseVal == "tick") {
    x = event.srcElement.parentElement.__data__;
  } else {
    x = event.target.__data__;
  }

  /**
   * Removing the color legend and rebuilding it again by calling the Legend_PC() function
   */
  d3.select("#svgColorLegend").html(null);
  Legend_PC(dims[currentColorScale]);

  /** 
   * Updating the data lines based on the updated axes and dims in the Parallel Coordinates plot
   */
  d3.selectAll(".datapath")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))

  /**
   * Making all the text of the active column to their default font-weight and size
   * 
   * id -> it stores the unique id of each axis, which is then passed styling the active column
   * examples of ID: IDyear, IDcylinders, IDdisplacement, ID060...
   * 
   */
  id = "#ID" + x.split(' ')[0].replace(/[^A-Z0-9]/ig, "");
  d3.select(id)
    .selectAll("text")
    .style("font-weight", "bold")
    .style("font-size", "10px");
}

/**
 * Helper function to change the color of the data lines as per the selection made in drop down menu
 * 
 * Ref: https://d3-graph-gallery.com/graph/line_select.html
 * 
 */
function updateSelection() {
  /**
   * selectedOptions -> takes the current value selected in drop down
   */
  selectedOption = d3.select("#columns")._groups[0][0].selectedOptions[0].value;

  /**
   * currentColorScale -> is a global variable to update the color of the data lines
   */
  currentColorScale = dims.indexOf(selectedOption)

  /**
   * Also updating the color legend
   */
  d3.select("#svgColorLegend").html(null);
  Legend_PC(dims[currentColorScale]);

  /** 
   * Updating the data lines based on the updated axes and dims in the Parallel Coordinates plot
   */
  d3.selectAll(".datapath")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))
}


// Returns a callback function that calls onBrush() for the brush
// associated with each dimension
/*
  The below function is called at each of the brush stage. 
  Logic: 
        On every call of onBrush function, I am updating the brushesRanges[] of the active column
  Input: brushes 
  Output: It will highlight the data lines common in all of the brushes and color the data lines not in common to their base colors.
*/
function updateBrush(dim) {
  return function (event) {
    brushRanges[dim] = event.selection;
    if (event.selection != null) {
      if (event.type == "start" || event.type == "end") {
        return;
      }
    }
    onBrush();
  };
}

// Callback when brushing to select elements in the PC plot
/***
 * 
 * The below function is called at each of the brush stage. 
 * 
 * Logic: 
 * On every call of onBrush function, I am making the data lines colored to their original/base color based on the first column of the parallel coordinates. And then using the filter feature to filter the data lines occuring in all of the brushes. 
 * 
 * Input: brushes 
 * Output: It will highlight the data lines common in all of the brushes and color the data lines not in common to their base colors.
 * 
 */
function onBrush() {

  /**
   * Setting the color of the data lines to their default color based on the first column of the parallel coordinates
   */
  let allLines = d3.selectAll(".datapath")
    .style("stroke", d => colorScales[dims[currentColorScale]](d[dims[currentColorScale]]))
    .style("opacity", 0.5);


  function isSelected(d) {
    /**
     * Changed the default value of selected variable from false to null but it can be done with the 'False' value as well which requires some minimal changes in the below logic
     */
    let selected = null;

    /**
     * Logic: Grabing the x and y coordinates of the lines with respect to the column on the y-axis and storing the coordinates forr each dim in a new object dimensions 
     * 
     */
    dimensions = {};
    dims.map(function (p) { return dimensions[p] = [xScale(p), yScales[p](d[p])]; });
    const keys = Object.keys(brushRanges);

    var inter;
    keys.forEach((key, index) => {
      /**
       * Checking if the data line points for each dim is occuring in the brush coordinates of that dim. It will compare the y coodinates of the data line points only since the brush range is in 1D.
       */
      if (brushRanges[key] != null) {
        inter = brushRanges[key][0] <= dimensions[key][1]
          && brushRanges[key][1] >= dimensions[key][1];
      }
      if (selected == null) {
        selected = inter
      } else {
        selected = selected && inter;
      }
    });
    return selected;
  }

  /**
   * Setting the opacity of the selected data lines to 0.75
   */
  let selected = allLines
    .filter(isSelected)
    .style("opacity", 0.75);

  /**
   * Returning if there are no active brushes
   */
  if (selected._groups[0].length == 0) {
    return;
  }

  /**
   * Setting the opacity of the non-selected data lines to 0.1
   */
  let notSelected = allLines
    .filter(function (d) { return !isSelected(d); })
    .style("opacity", 0.1);
}

