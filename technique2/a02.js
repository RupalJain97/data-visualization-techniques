// 
// a02.js
// Skeleton for CSC544 Assignment 02
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the skeleton code for setting up the SPLOM
// 

// Modifications for CSC 544 Assignment 02
// Rupal Jain (jainrupal@arizona.edu)
//

// References: https://observablehq.com/@d3/brushable-scatterplot-matrix
//             https://observablehq.com/@d3/splom



//////////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries to draw the grid


// Comment out one of the following two lines to select a dataset
data = iris;
// data = scores;


/*
 Logic to plot a collection of svg elements given an input dataset in Brushable Scatterplot Matrix format
 Variables:
   width -> set width of the viewbox which is the main svg
   height -> set height of the viewbox which is the main svg
   padding -> setting the padding value for the viewbox which is the main svg
   attribs -> This variable contains all the attributed of the datasets, for example: SATM, SATV, ACT, GPA
   size -> This variable is used to set the size of the individual scatterplots in the matrix. Specifically, it determines the width and height of each scatterplot cell
*/
padding = 28;
width = 924;
height = 924;

let attribs = Object.keys(data[0]).filter(d => typeof data[0][d] === "number");

let size = (width - (attribs.length + 1) * padding) / attribs.length + padding;


/*
 Variables:
  * The variables x, y, and z are used to define the positions of the points on the scatterplot. 
   -- x and y are used to set the horizontal and vertical positions of each point in the scatterplot. They are defined using d3.scaleLinear() scales, which map the range of input values to the range of output values. Range: [14, 210]
   -- z is used to set the color of the circles representing each data point in the scatterplot. It is defined using another d3.scaleOrdinal() scale, which maps the species category to a specified output color range for the circles in case of Iris data, whereas in case of Scores data, the color remains the same. Range: [210, 14]
   -- z2 is similar to z but is used to set the color to more darker colors in case the data points are selected when using brushes.
  
*/
x = attribs.map(c => d3.scaleLinear()
  .domain(d3.extent(data, d => d[c]))
  .rangeRound([padding / 2, size - padding / 2]))

y = x.map(x => x.copy().range([size - padding / 2, padding / 2]))

if (data == iris) {
  z = d3.scaleOrdinal()
    .domain(data.map(d => d.species))
    .range(d3.schemeCategory10)
} else {
  z = d3.scaleSequential().domain(data.map(d => d.GPA))
    .interpolator(d3.schemeTableau10);
}


/*
 Variables:
    xaxis, yaxis -> The xaxis and yaxis variable is used to create a new d3 axis for each dimension of the scatterplot. It defines the number of ticks and its size using the number of attributed present in the dataset.  
*/
xaxis = d3.axisBottom()
  .ticks(6)
  .tickSize(size * attribs.length)

yaxis = d3.axisLeft()
  .ticks(6)
  .tickSize(-size * attribs.length);


/*
  Creating color codes legend for better mapping
*/
if (data == iris) {
  d3.select("#colorLegend_a02")
    .append("span")
    .attr("class", "-swatches-0bbedc9e48783")
    .attr("style", "--color: #1f77b4")
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size + 75},0)`)
    .attr("x", padding)
    .attr("y", width + padding / 2)
    .text("Setosa");
  d3.select("#colorLegend_a02")
    .append("span")
    .attr("class", "-swatches-0bbedc9e48783")
    .attr("style", "--color: #ff7f0e")
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size + 75},0)`)
    .attr("x", padding)
    .attr("y", width + padding / 2)
    .text("Versicolor");
  d3.select("#colorLegend_a02")
    .append("span")
    .attr("class", "-swatches-0bbedc9e48783")
    .attr("style", "--color: #2ca02c")
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size + 75},0)`)
    .attr("x", padding)
    .attr("y", width + padding / 2)
    .text("Virginica");
} else {
  d3.select("#colorLegend_a02").append("span")
    .attr("class", "-swatches-0bbedc9e48783")
    .attr("style", "--color: black")
    .join("text")
    .attr("transform", (d, i) => `translate(${i * size + 75},0)`)
    .attr("x", padding)
    .attr("y", width + padding / 2)
    .text("Scores");
}


// Creating svg under the div tag having id as '#div1' and assigning the svg an id as 'Main'. This svg will include 3 group <g> components: MainPlot, Y axis Labels and X axis Labels
let svg = d3.select("#div1_a02")
  .append("svg")
  .attr("id", "Main")
  .attr("viewbox", [0, 0, width, height])
  .attr("width", width + padding)
  .attr("height", height + padding - 10)


// Creating a new group <g> with id as 'MainPlot'. This tag will contain all the data points, matrix rectangles, brushing components
let mainPlot = svg.append("g")
  .attr("id", "mainPlot")
  .attr("transform", "translate(20,0)")


// Creating a group component with id as 'Plot'. This will create all the matrix cells by appending group tags for each cell.
let cell = mainPlot.append("g")
  .attr("id", "Plot")
  .attr("transform", `translate(10,0)`)
  .selectAll("g")
  .data(d3.cross(d3.range(attribs.length), d3.range(attribs.length)))
  .join("g")
  .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`)
  .attr("id", "Group");


// Appending the horizontal and vertical axes of each scatterplot in the matrix under the MainPlot. This generates the actual axis lines, tick marks, and tick labels that are displayed in the visualization. The data passed here is the data points to be plotted. 
// Below code will form ticks and lines on x axis
mainPlot.append("g")
  .selectAll("g")
  .data(x)
  .join("g")
  .attr("transform", (d, i) => `translate(${i * size + 20},0)`)
  .each(function (d) { return d3.select(this).call(xaxis.scale(d)); })
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line")
    .attr("stroke-opacity", 0.1))

// Below code will form ticks and lines on y axis
mainPlot.append("g")
  .selectAll("g")
  .data(y)
  .join("g")
  .attr("transform", (d, i) => `translate(20,${i * size})`)
  .each(function (d) { return d3.select(this).call(yaxis.scale(d)); })
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line")
    .attr("stroke-opacity", 0.1));


// Appending the horizontal and vertical axes Labels under the parent SVG. This prints axis labels in the visualization. The data passed here contains the attributes names.
// Below code will print axis labels on x axis
svg.append("g")
  .attr("id", "Labels")
  .style("pointer-events", "none")
  .selectAll("text")
  .data(attribs)
  .join("text")
  .attr("transform", (d, i) => `translate(${i * size + 75},0)`)
  .attr("x", padding)
  .attr("y", width + padding / 2)
  .text(d => d);

// Below code will print axis labels on y axis
svg.append("g")
  .attr("id", "Labels")
  .style("pointer-events", "none")
  .selectAll("text")
  .data(attribs)
  .join("text")
  .attr("transform", (d, i) => `translate(0,${i * size + 170}) , rotate(-90)`)
  .attr("x", padding)
  .attr("y", padding - 15)
  .text(d => d);


/*
 Variables using for Brushing and linking:
    brushes -> This master variable is a list that contains the brushes currently active in the viewspace. It will store the [[x0, y0], [x1, y1]] format of the points of every brush selection. Apart from this, it will also store the position of the cell [i,j] like [0,0], [2,1], this is required to remove the brush when the selection has been taken back i.e. the brush selection has been removed from the view. I have used this position to directly get to the position and check if the brush has been removed or not. 
    If the brush has been removed, then the brush will also be removed from the master variable "brushes", so that we can show only the data points present in the active brushes. 

    Example:  [[x0, y0],[x1, y1]],   PosID
              [[94, 68] [211, 207]], "#Pos21"
              [[92, 96] [186, 174]], "#Pos31"
*/
/*
  CurrentBrushes -> It is a helper variable to store the current brush coordinates as it moves from the stage: start -> brush -> end. We will store only the last brush coordinates into the master variable. The format will be the same master variable
*/
/*
  PosID -> this variable is also a helper variable that is used to provide the id of the brush group component under which the selection has been made by the user. This id has been extracted from the event variable whenever a selection has been made.
*/
let brushes_a02 = []
var Currentbrushes_a02 = null
let PosID = null;

// Creating rectangles for each cell by setting the x coordinate, y coordinate, width and height values and appending it under each cell in MainPlot
let groups = cell.append("rect")
  .attr("fill", "none")
  .attr("stroke", "#aaa")
  .attr("x", padding / 2 + 0.5 + 10)
  .attr("y", padding / 2 + 0.5)
  .attr("width", size - padding)
  .attr("height", size - padding);

//call makeScatterplot() once per group
// For each cell, calling makeScatterplot function to plot the data points.
cell.each(function (attrib_pair) {
  makeScatterplot(d3.select(this), attrib_pair);
})





//////////////////////////////////////////////////////////////////////////////
// Function to make the scatteplots

/*
Function to plot the data points in each cell.
Logic: Stores the position of the cell in the matrix to calculate the position of the data points accordingly
Input: selection, 
      attrib_pair = [0,0]     // where [0,0] means data points to be plotted for the sepalLength vs sepalLength

Output: appending data points in html
*/
function makeScatterplot(selection, attrib_pair) {
  // Using attrib_pair to assign xCoor and yCoor, they are used to store the position of the cell given in the format [i, j]
  xCoor = attrib_pair[0]    // [0,1,2,3]
  yCoor = attrib_pair[1]    // [0,1,2,3]

  /* 
    The scales for each column have been created above using a loop of the total number of attributes. The logic used in that will create scales for each row and each column in matrix. By row, it means the cells [0,0], [0,1], [0,2], [0,3] and by column, it means the cells [0,0], [1,0], [2,0], [3,0].
    This has been done to avoid creating duplicate scales at the same positions.  
  */

  // Added the coordoinates to be passed to extend function
  let brush = d3.brush()
    .extent([[padding / 2 - 10, padding / 2 - 10], [size - padding / 2 + 10, size - padding / 2 + 10]])
    .on("start", updateBrush_a02())
    .on("brush", updateBrush_a02())
    .on("end", updateBrush_a02());

  // Creating a new group tag for each brush and assigning an ID to that tag. 
  let matrixCell = selection.append("g").attr("id", `#Pos${xCoor}${yCoor}`)

  // Appending the brush tag to the group tag created above having id as their position in the matrix. This is required to keep track of the brushes currently in use or active.
  matrixCell.append("g")
    .attr("class", "brush")
    .attr("transform", `translate(10,0)`)
    .call(brush);

  // Appending each data point in the form of a circle along with its attributes as cx, cy and radius
  // Extra functionality: whenever there is hover at the data point, the value of the attributes will be displayed in which the data point is being append
  let circles = selection.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x[xCoor](d[attribs[xCoor]]) + 10)  // Using the x variable defined above to plot the data point within the range of each cell in the matrix
    .attr("cy", d => y[yCoor](d[attribs[yCoor]]))     // Using the y variable defined above to plot the data point within the range of each cell in the matrix
    .attr("r", 2.5)
    .attr("fill-opacity", 0.7)
    .attr("fill", function (d) {
      // Using the z variable defined above to provide color to the data point based on the type of species in iris dataset. In scores dataset, a different color is used 
      if (d.species == undefined) {
        return z(d.GPA);
      } else {
        return z(d.species);
      }
    })
    .text(function (d) {
      // Added text in html to depict the x and y coordinate of the cell and the values of them
      return attribs[xCoor] + ":" + d[attribs[xCoor]] + ", " + attribs[yCoor] + ":" + d[attribs[yCoor]]
    })
    .on("mousemove", function (d) {
      return attribs[xCoor] + ":" + d[attribs[xCoor]] + ", " + attribs[yCoor] + ":" + d[attribs[yCoor]]
    })
}



//////////////////////////////////////////////////////////////////////////////
// Function to for the brush interactions

/*
  The below function is called when the brush is started till the end stage. The stages include start, brush...(*x)., end. There are multiple calls for brush stage because of the dragging functionality, the brush stage is called starting from the initial point and gradually increasing the [x1,y1] coordinates of the hightlighted area and ultimately comes to an end.
  We are calling the updateBrush_a02() on every stage of the brushing and have thus organized the function to be suitable in all the stages.

  Logic: I have used if else condition for each stage.
          Start -> Making the CurrentBrushes as Null for the active brush. This is required to save the states of the brush coordinates and ultimately store the last brush coordinates when completed.
          Brush -> Adding the brush coordinates to the master variable Brushes and poping the last added brush of the same active brush. 
          End -> Making the PosID as NULL so that it can be used for the next brush

  Input: event 

  Output: It will highlight the data points common in all of the brushes and color the data points not in common to their base colors.
*/
function updateBrush_a02() {
  return function (event) {

    if (event.selection != null) {
      //store the selected range for use in onBrush_a02()

      /*
      The selected range here is addressed by the brushes variable which store the final coordinates of the brushing rectangle and is used in onBrush_a02 function to highlight the points in real time

      To keep the selection from all the brushes is maintained by the master variable 'brushes' as explained above. 
      */

      if (event.type == "start") {
        // PosID stores the position of the cell in which highlighing is being made.
        PosID = event.sourceEvent.srcElement.parentNode.parentElement.id

        /*
        Here, I am checking for the active brushes in the view and removing the entry of the brush from brushes variable if the highlight has been removed or even moved. 
        
        We can achive this by multiple ways:
          1. Using the property: "style:'display: none;'". Whenever any highlight is made, this display style is removed from the tag, whereas when the highlight is removed from the view, the brush applies display none style to the rect.selection tag again. 
          2. Whenever any brush is being moved or dragged or even deselected from the cell, start stage is triggered and we will check if the PosID of this brush is already present in the master variable or not. If present, we will remove it. If the brush is dragged, then brush state will trigger and will again add the brush entry to the master variable.
        */

        brushes_a02.forEach(function (element, i) {
          if (element[1] == PosID) {
            brushes_a02.splice(i, 1)
          }
        })

        Currentbrushes_a02 = null

        // We are returning from start stage as the brushes is still empty and going into onBrush_a02 can be avoided.
        return;
      }
      else if (event.type == "brush") {
        // If the currenBrushes is null then we will push the coordinates of the highlighted rectangle for the first time.

        if (Currentbrushes_a02 != null) {
          brushes_a02.pop()
          Currentbrushes_a02 = event.selection
          brushes_a02.push([event.selection, PosID])
        } else {
          Currentbrushes_a02 = event.selection
          brushes_a02.push([event.selection, PosID])
        }
      }
      else if (event.type == "end") {
        // Making the PosID as null as that it can be used for the next brush.
        // Returning from the end stage because the event is null and the last brush coordinated has already been processed.
        PosID = null;
        return;
      }
    }
    onBrush_a02();
  };
}

/*
  The below function is called at each of the brush stage. 

  Logic: 
        On every call of onBrush_a02 function, I am making the data points colored to their original/base color which was based on the type of species. And then using the filter feature to filter the data points lying in all of the brushes.

  Input: brushes 

  Output: It will highlight the data points common in all of the brushes and color the data points not in common to their base colors.
*/
function onBrush_a02() {
  function isSelected(d) {
    // Changed the default value of selected variable from false to null but it can be done with the 'False' value as well which requires some minimal changes in the below logic
    let selected = null;

    /*
      Logic: Grabing the cx and cy coordinates of the circle and checking if the circle appears in all of the brushes or not.
    */
    var XPoint = parseFloat(this.attributes.cx.value)
    var YPoint = parseFloat(this.attributes.cy.value)
    brushes_a02.forEach(function (brush) {
      // Checking: cx coordinate shoud be between [x0] and [x1] coordinates of the brushing rectangle.
      // Checking: cy coordinate shoud be between [y0] and [y1] coordinates of the brushing rectangle.
      // Here [x0, y0] and [x1, y1] are the coordinated of a single brush
      inter = brush[0][0][0] <= XPoint
        && brush[0][1][0] >= XPoint
        && brush[0][0][1] <= YPoint
        && brush[0][1][1] >= YPoint

      if (selected == null) {
        selected = inter
      } else {
        /*
          To get the circles existing in all the brushes, I have used 'AND'/ && operation, which is why I have changed the default value of the selected variable.

          To get the circles existing in all the brushes, we can use 'OR'/ || operation instead.
        */
        selected = selected && inter;
      }
    });
    return selected;
  }

  function isNotSelected(d) {
    let selected = true;
    var XPoint = parseFloat(this.attributes.cx.value)
    var YPoint = parseFloat(this.attributes.cy.value)
    brushes_a02.forEach(function (brush) {
      inter = (brush[0][0][0] > XPoint
        || brush[0][1][0] < XPoint
        || brush[0][0][1] > YPoint
        || brush[0][1][1] < YPoint)

      selected = selected || inter;
    });
    return selected;
  }

  let allCircles = d3.select("#assign2").selectAll("circle");

  // Instead of setting a different style of the non-selected circles, I had assigned a style to all of the circles before and then change the style of the selected circles.
  allCircles
    .attr("r", 2.5)
    .attr("fill", function (d) {
      if (d.species == undefined) {
        return z(d.GPA);
      } else {
        return z(d.species);
      }
    })


  allCircles
    .filter(isSelected)
    .attr("r", 3.5)
    .attr("fill", function (d) {
      if (d.species == undefined) {
        return z(d.GPA);
      } else {
        return z(d.species);
      }
    })

}


