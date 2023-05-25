// 
// svg.js
// Helper functions for CSC544 Assignment 01
// Joshua A. Levine <josh@arizona.edu>
//
// This file includes Javascript methods to create SVG elements,
// together with a helper function for you to create RGB triplets (in
// order to give your visualization data-driven colors)

// Originally from: Carlos Scheidegger with minor edits.



// Function to create an SVG element
// inputs:
//   name: a string w/ the type of SVG element (svg, rect, etc..)
//   attrs: an obj with the attributes and values to set in the element
//
// returns: the created SVG element
function make(name, attrs)
{
    var element = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs === undefined) attrs = {};
    for (var key in attrs) {
        if (key === 'text') {
            //debugger;
            element.textContent = attrs[key];
        } else {
            element.setAttributeNS(null, key, attrs[key]);
        }
    }
    return element;
}


// Function to plot a collection of svg elements given an input dataset
// inputs:
//   svg: the SVG Node to append to
//   data: the data array
//   element: a string w/ the type of SVG element to plot for each datum
//   attributeGetters: an obj with getters defined for each attribute
//     associated with the particular element type.  getters expect to
//     be a function that passes in the data element and it's index i
//
// returns: the updated svg canvas
function plotAll(svg, data, element, attributeGetters)
{
    var obj;
    for (var i=0; i<data.length; ++i) {
        obj = {};
        for (var key in attributeGetters) {
            obj[key] = attributeGetters[key](data[i], i);
        }
        svg.appendChild(make(element, obj));
    }
    return svg;
}


// Helper function to convert a number betwee 0..255 to hex
function toHex(v) {
    var str = "00" + Math.floor(Math.max(0, Math.min(255, v))).toString(16);
    return str.substr(str.length-2);
}


// Helper function to be a hex string out 3 numbers r,g,b in 0..1
function rgb(r, g, b)
{
    return "#" + toHex(r * 255) + toHex(g * 255) + toHex(b * 255);
}

