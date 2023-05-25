// Visualization 3

// plot3.js
// Helper functions for CSC544 Assignment 01
// Rupal Jain <jainrupal@arizona.edu>
//
// This file includes D3 calls to plot te data points and include color for the points based on the GPA.

// References: https://d3-graph-gallery.com/graph/custom_color.html
// https://d3-graph-gallery.com/graph/scatter_basic.html
// https://d3-graph-gallery.com/graph/custom_axis.html
// https://github.com/d3/d3-scale-chromatic


// Logic to plot a collection of svg elements given an input dataset
// Variables:
//   data: storing the information in scores.js
data = scores


// Using D3 function calls to append svg tag to the div with id "div3" and its attributes (width and height to 500)
let svg3 = d3.select("#div3")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400)


// Creating scales for both the X and Y axis, setting the domain based on the maximum and minimum values of the sum of SAT scores and ACT scores. Padding has been used to make the graph look clean and to give some space of the side of the div3 element. Setting the range based on the screen space available
// in the below scale, domain [680, 1580] and range[50, 475]
let xScale = d3.scaleLinear()
    .domain([minX - padding, maxX])
    .range([padding, width - (padding / 2)])

// in the below scale, domain [15, 35] and range[450, 25]
let yScale = d3.scaleLinear()
    .domain([minY, 35])
    .range([height - padding, 25])


// Creating an Bottom Axis using xScale defined above
xAxis = d3.axisBottom().scale(xScale);


// Creating an Left Axis using yScale defined above
yAxis = d3.axisLeft().scale(yScale);

// Using the D3 function call : Crreating sequential scale which is similar to a continuous scale. Mapping of data points is done between domain and range provided. In this case, range will be defined by interpolator. d3.interpolateTurbo is used to define the color range for the GPA values with domain as [1,4]
// This way seems out to be more efficient way to add colors to the data points. 
var circleColor = d3.scaleSequential().domain([1, 4])
    .interpolator(d3.interpolateTurbo);

// Appending a new group tag to display the Bottom axis and its attributes. We are calling xAxis to set the domain and range of the scale
svg3.append("g")
    .attr("transform", `translate(0,${width - padding})`)
    .call(xAxis);

// Appending a new group tag to display the Left axis and its attributes. We are calling yAxis to set the domain and range of the scale
svg3.append("g")
    .attr("transform", `translate(${padding},0)`)
    .call(yAxis);

/*
Appending labels the complete X and Y axis.
Display "Sum of SATV and SATM score" label on the X axix and "ACT score" label on the Y axis
*/
svg3.append("text")
    .attr("text-anchor", "end")
    .attr("x", 360)
    .attr("y",390)
    .text("Sum of SATV and SATM score")
    .style("font-size", 15)
    .style("fill", "#30127cb5")

svg3.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -50)
    .attr("y", 20)
    .text("ACT Score")
    .style("font-size", 15)
    .style("fill", "#30127cb5")


// Marking the origin of the div3
svg3.append("text")
    .attr("text-anchor", "end")
    .attr("x", 32)
    .attr("y", 394)
    .style("font-size", 15)
    .text("(0,0)")

// Appending a new group tag to display the data points and their attributes
// Attributes for the circle tag has cx (x coordinate of the circle having sum of score from SATM and SATV test), cy (y coordinate of the circle having score from ACT test), r (radius of the circle showing the GPA), fill (fill the circle with color based on the GPA)
svg3.append("g")
    .attr("transform", `translate(${padding + 25},${padding})`)
    .selectAll("circle")
    .data(data).enter()
    .append("circle")
    .attr("cx", function (data) {
        // cx and cy have the same logic as in VIsualization 1. We are mapping the data points in the range of the screen space using Normalization.
        // Converting the data points to range [0,400]
        var val = ((data.SATM + data.SATV) - minX) * (300 / (maxX - minX))
        return val;
    })
    .attr("cy", function (data) {
        // To plot the points in the graph having (0,0) its origin on the left bottom end, the value is converted to range [0,400].
        var val = ((maxY - data.ACT) * (300 / (maxY - minY)))
        return val;
    })
    .attr("r", function (data) {
        return data.GPA;
    })
    .attr("fill", function (data) {
        // Calling circleColor() function to fill the circles according to their GPA based on the color range
        return circleColor(data.GPA)
    });
