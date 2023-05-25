// Visualization 2
// 
// plot2.js
// Helper functions for CSC544 Assignment 01
// Rupal Jain <jainrupal@arizona.edu>
//
// This file includes Javascript methods to create SVG elements,
// and uses the helper functions from svg.js to plot the points with color variation using RGB triplets to give visualization

// References for color encoding: https://cscheid.net/courses/fall-2019/csc444/lectures/lecture4/iteration_8.js

/*
 Logic to plot a collection of svg elements given an input dataset
 Variables:
   width -> set width of the element
   height -> set height of the element
   padding -> setting the padding value for the element
*/

var width = 400;
var height = 400;
let padding = 50;

/*
Helper functions defined below are used to geet the minimum and maximum values of 2 values:
1. sum of SAT scores i.e. SATM + SATV
2. ACT score

Input for all the below functions is the 'scores' object defined in scores.js
getMinX() -> returns minimum of (SATV + SATM)
getMaxX() -> returns maximum of (SATV + SATM)
getMinY() -> returns minimum of ACT score
getMaxY() -> returns maximum of ACT score
*/
function getMinX() {
    return scores.reduce((max, b) => Math.min(max, b.SATM + b.SATV), scores[0].SATM + scores[0].SATV);
}
function getMaxX() {
    return scores.reduce((max, b) => Math.max(max, b.SATM + b.SATV), scores[0].SATM + scores[0].SATV);
}
function getMinY() {
    return scores.reduce((max, b) => Math.min(max, b.ACT), scores[0].ACT);
}
function getMaxY() {
    return scores.reduce((max, b) => Math.max(max, b.ACT), scores[0].ACT);
}

/*
Variables:
    svg2: the SVG Node to append to
    divTag: storing reference to the <div> tag with id as "div2"
    header: creating a heading tag <h1> to mark the start the visualization
    para: creating paragraph tag to append the answers to the written questions
    maxY --> calling the functions defined above to get the maximum of ACT score
    minY --> calling the functions defined above to get the minimum of ACT score
    maxX --> calling the functions defined above to get the maximum of sum of SATM and SATV score
    minX --> calling the functions defined above to get the minimum of sum of SATM and SATV score
*/
var maxY = getMaxY();
var minY = getMinY();
var maxX = getMaxX();
var minX = getMinX();


// Calling make() function from svg.js to create the svg element and set its attributes
var svg2 = make("svg", { width: 400, height: 400 });

var divTag = document.getElementById("div2");

// Appending the elements defined above to the div tag (#div2) in index.html
divTag.append(svg2);

/*
Below variables are used to generate the X and Y axis for the plot using the line tag and calling make function. Attributes for the line tag are also passed in make function.
    yline -> making the Y Axis for the plot and putting dimensions according to the 500*500 space of the div2
    xline -> making the X Axis for the plot and putting dimensions according to the 500*500 space of the div2
    yelement -> making the last point on Y Axis for the plot and putting dimensions according to the 500*500 space of the div2
    xelement -> making the last point in X Axis for the plot and putting dimensions according to the 500*500 space of the div2
*/
var yline = make("line", { class: "axis", x1: "50", y1: "25", x2: "50", y2: "350" })

var xline = make("line", { class: "axis", x1: "50", y1: "350", x2: "376", y2: "350" })

var yelement = make("line", { x1: "44", y1: "25", x2: "50", y2: "25" })

var xelement = make("line", { x1: "376", y1: "350", x2: "376", y2: "356" })

// Appending the above elements to the svg tag in div2
svg2.append(xline)
svg2.append(yline)
svg2.append(xelement)
svg2.append(yelement)

/*
Helper functions defined below are used for markings on the X and Y axis, the markings on X axis are for the range [700-1500] with 100 points difference. Similary, markings on Y axis are for the range [16-34] with 2 points difference between them. 

Also the labels of these markings are putted in the same loop, this will reduce the computation of running the loop again.

    xaxis() -> put markings and labels on X Axis
    yaxis() -> put markings and labels on Y Axis
*/
function xaxis() {
    var count = 0;
    // Value is used for labelling the coordinates of the X axis
    var value = 700;
    var i = 0;
    while (count != 9) {
        /*
            Putting the markings on the X axis 
        */
        var element = document.createElementNS("http://www.w3.org/2000/svg", "line");
        element.setAttributeNS(null, "x1", 60 + i);
        element.setAttributeNS(null, "y1", 350);
        element.setAttributeNS(null, "x2", 60 + i);
        element.setAttributeNS(null, "y2", 356);
        svg2.append(element)

        /*
            Putting the labels for each markings on the X axis
        */
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttributeNS(null, "class", "coordinates");
        text.setAttributeNS(null, "x", 50 + i);
        text.setAttributeNS(null, "y", 367);
        text.textContent = value.toString();
        svg2.append(text);
        value = value + 100;

        // increase the counter 
        count = count + 1;

        // 47 is the amount of distance between 2 markings
        i = i + 37;
    }
}

function yaxis() {
    var count = 0;
    var i = 0;
    // Value is used for labelling the coordinates of the X axis 
    var value = 16;
    while (count != 10) {
        /*
            Putting the markings on the Y axis 
        */
        var element = document.createElementNS("http://www.w3.org/2000/svg", "line");
        element.setAttributeNS(null, "x1", 44);
        element.setAttributeNS(null, "y1", 327 - i);
        element.setAttributeNS(null, "x2", 50);
        element.setAttributeNS(null, "y2", 327 - i);
        svg2.append(element)

        /*
            Putting the labels for each markings on the Y axis
        */
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttributeNS(null, "class", "coordinates");
        text.setAttributeNS(null, "x", 28);
        text.setAttributeNS(null, "y", 330 - i);
        text.textContent = value.toString();
        svg2.append(text);
        value = value + 2;

        // increase the counter
        count = count + 1;

        // 42 is the amount of distance between 2 markings
        i = i + 42;
    }
}

// Calling the functions above to complete the work of showing X and Y axis
xaxis()
yaxis()

// Marking the origin of the div2
var Origintext = document.createElementNS("http://www.w3.org/2000/svg", "text")
svg2.append(Origintext)
Origintext.setAttributeNS(null, "text-anchor", "end")
Origintext.setAttributeNS(null, "x", 32)
Origintext.setAttributeNS(null, "y", 394)
Origintext.setAttributeNS(null, "font-size", 15)
Origintext.textContent = "(0,0)"


/* <text x="5" y="490">(0,0)</text>
      <text x="40" y="490">&#8594;</text>
      <text x="5" y="470">&#8593;</text> */


/*
Below variables are used to label the complete X and Y axis
    xtext -> to display "Sum of SATV and SATM score" label on the X axis
    ytext -> to display "ACT score" label on the Y axis
*/
var xtext = document.createElementNS("http://www.w3.org/2000/svg", "text")
svg2.append(xtext)
xtext.setAttributeNS(null, "text-anchor", "end")
xtext.setAttributeNS(null, "x", 360)
xtext.setAttributeNS(null, "y", 390)
xtext.setAttributeNS(null, "style", "fill: #30127cb5; font-size: 15px;")
xtext.textContent = "Sum of SATV and SATM score"

var ytext = document.createElementNS("http://www.w3.org/2000/svg", "text")
svg2.append(ytext)
ytext.setAttributeNS(null, "text-anchor", "end")
ytext.setAttributeNS(null, "transform", "rotate(-90)")
ytext.setAttributeNS(null, "x", -50)
ytext.setAttributeNS(null, "y", 20)
ytext.setAttributeNS(null, "style", "fill: #30127cb5; font-size: 15px;")
ytext.textContent = "ACT Score"


// Below variable 'plot' is used to club all the data points and put them in one group tag 
var plot = make("g", { transform: `translate(${padding + 25},${padding})` })
svg2.append(plot)


// Calling plotAll function from svg.js to plot the data points and also set their attributes
// Attributes for the circle tag has cx (x coordinate of the circle having sum of score from SATM and SATV test), cy (y coordinate of the circle having score from ACT test), r (radius of the circle showing the GPA), fill (fill the circle with color based on the GPA)
plotAll(plot, scores, "circle", {
    // cx and cy have the same logic as in VIsualization 1. We are mapping the data points in the range of the screen space using Normalization.
    // Converting the data points to range [0,400]
    cx: function (data) {
        var val = ((data.SATM + data.SATV) - minX) * (300 / (maxX - minX))
        return val;
    },
    // To plot the points in the graph having (0,0) its origin on the left bottom end, the value is converted to range [0,400].
    cy: function (data) {
        var val = ((maxY - data.ACT) * (300 / (maxY - minY)))
        return val;
    },
    r: function (data) { return data.GPA },
    fill: function (data) {
        /*
        Below lines are calculating hex value based on the GPA
        * 4 GPA (maximum) will have a color with hex value as rgb(138, 7, 7)
        * 1 GPA (minimum) will have a color with hex value as rgb(255,198,198)
        
        Logic: 
        1. converting the range of gpa to the range [0,255]
        2. Then calculating the separate values for r, g, and b by adding the rgb of the darkest color.
        3. Calling rgb function of svg.js file to generate the final hex value

        Input: GPA = 2.534

        gpa = (4 - 2.534) / 4 * 255 = 93.45
        r = 93.45 + 138 = 231.45
        g = 93.45 / 2 + 7 = 53.725
        b = 93.45 / 2 + 7 = 53.725
        hx = rgb(231.45/255, 53.725/255, 53.725/255)
        
        Calling rgb function from svg.js
        Input: 231.45/255, 53.725/255, 53.725/255
        
        Calling toHex function from svg.js
        Input: 231.45, 53.725, 53.725
        
        var strR = "00" + Math.floor(Math.max(0, Math.min(255, 231.45))).toString(16) = 00e7
        var strG = "00" + Math.floor(Math.max(0, Math.min(255, 53.725))).toString(16) = 0035
        var strB = "00" + Math.floor(Math.max(0, Math.min(255, 53.725))).toString(16) = 0035
        r = strR.substr(strR.length - 2)) = e7
        g = strG.substr(strG.length - 2)) = 35
        b = strB.substr(strB.length - 2)) = 35

        Output: a hex value in the form of #e73535
        */
        var gpa = (4 - data.GPA) / 4 * 255;
        var r = gpa + 138;
        var g = gpa / 2 + 7;
        var b = gpa / 2 + 7;
        var hx = rgb(r / 255, g / 255, b / 255);
        return hx;
    }
})

