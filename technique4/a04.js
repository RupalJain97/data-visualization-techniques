// 
// a04.js
// Template for CSC544 Assignment 04
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the template code for A04, providing a skeleton
// for how to initialize and draw tree maps  
//

// 
// Modified a03.js
// CSC544 Assignment 03
// Rupal Jain <jainrupal@arizona.edu>
//
//

////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 


////////////////////////////////////////////////////////////////////////
// Tree related helper functions

/**
 *  You will use the depth of a given node to decide whether or not it is a horizontal or vertical split
 */

function setTreeSize(tree) {
  if (tree.children !== undefined) {
    let size = 0;
    for (let i = 0; i < tree.children.length; ++i) {
      size += setTreeSize(tree.children[i]);
    }
    tree.size = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.size;
};

function setTreeCount(tree) {
  if (tree.children !== undefined) {
    let count = 0;
    for (let i = 0; i < tree.children.length; ++i) {
      count += setTreeCount(tree.children[i]);
    }
    tree.count = count;
  }
  if (tree.children === undefined) {
    tree.count = 1;
  }
  return tree.count;
}

function setTreeDepth(tree, depth) {
  // TODO: WRITE THIS PART. Use the code above as example

  tree.depth = depth;
  maxDepth = Math.max(maxDepth, tree.depth);

  if (tree.children !== undefined) {
    for (let i = 0; i < tree.children.length; ++i) {
      depth = setTreeDepth(tree.children[i], tree.depth + 1);
    }
  }
  return tree.depth;
};


// Initialize the size, count, and depth variables within the tree
let Treesize;

let winWidth;
let winHeight;

// let maxDepth = setTreeDepth(data, 0);  --> original line
/**
 * Setted the maxdepth to zero, and then calling the setTreeDepth function to mark the dept of each node. Root has depth as 0 and the leaf nodes have the maximum depth.
 */
let maxDepth = 0;
let depth;

/**
 * Colorscale defined and interpolatePurples color has been used for good visualization
 */
let colorScale;
let scale;

// make a list of all tree nodes;
function makeTreeNodeList(tree, lst) {
  lst.push(tree);
  if (tree.children !== undefined) {
    for (let i = 0; i < tree.children.length; ++i) {
      makeTreeNodeList(tree.children[i], lst);
    }
  }
}

let treeNodeList = [];


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion

/**
 * set the visual attributes of each rect. This should use all of the information that you’ve inserted in the tree through the four “set” functions.
 */
function setAttrs(sel) {
  // TODO: WRITE THIS PART.
  sel.attr("width", function (treeNode) {return treeNode.rect.x2 - treeNode.rect.x1; })
    .attr("height", function (treeNode) { return treeNode.rect.y2 - treeNode.rect.y1; })
    .attr("x", function (treeNode) { return treeNode.rect.x1; })
    .attr("y", function (treeNode) { return treeNode.rect.y1; })
    .attr("fill", function (treeNode) { return colorScale(treeNode.depth) })
    .attr("stroke", function (treeNode) { return "Black"; });
}

/**
 * Main function call for the treemap
 */
function main_a04() {
  data = flare;
  // Initialize the size, count, and depth variables within the tree
  Treesize = setTreeSize(data);
  setTreeCount(data);


  // let maxDepth = setTreeDepth(data, 0);  --> original line
  /**
   * Setted the maxdepth to zero, and then calling the setTreeDepth function to mark the dept of each node. Root has depth as 0 and the leaf nodes have the maximum depth.
   */
  maxDepth = 0;
  depth = setTreeDepth(data, 0, maxDepth);

  /**
   * Colorscale defined and interpolatePurples color has been used for good visualization
   */
  colorScale = d3.scaleSequential()
    .domain([maxDepth, 0])
    .interpolator(d3.interpolatePurples);

  scale = null;

  lastRect = { x1: 0, y1: 0, x2: 0, y2: 0 };

  // initialize the tree map
  winWidth = 1228;
  winHeight = 571;
  // winWidth: 1536, winHeight: 714

  // compute the rectangles for each tree node
  setRectangles(
    { x1: 0, y1: 0, x2: winWidth, y2: winHeight }, data,
    function (t) { return t.size; }
  );

  treeNodeList = [];
  makeTreeNodeList(data, treeNodeList);

  // d3 selection to draw the tree map 
  let gs = d3.select("#svg_a04")
    .attr("width", winWidth)
    .attr("height", winHeight)
    .selectAll("g")
    .data(treeNodeList)
    .enter()
    .append("g");

  gs.append("rect").call(setAttrs);

  gs.select("rect").append("title")
    .text(function (treeNode) {
      return treeNode.name;
    });
}


////////////////////////////////////////////////////////////////////////
// Main Code for the Treemapping Technique


/**
 * This function should set the variable rect for each node in the tree. This code is currently set to store the minimum and maximum 
x-value (x1, x2) and the minimum and maximum 
y-value (y1, y2) for each rectangle, but you are allowed to change this if it is more convenient to store different information necessary to draw the rectangles. Note that setRectangles() is coded generically to compute the area of the rectangles using either count or size through the accessor attrFun()
 */
function setRectangles(rect, tree, attrFun) {
  tree.rect = rect;
  /**
   * Flag is used as a helper variable for the Squarified treemap feature. It is used to check if the rect has been set or not.
   */
  tree.flag = false;

  if (tree.children !== undefined) {
    let cumulativeSizes = [0];

    /**
     * Calculating the cummulative sum of the size of each children.
     */
    for (let i = 0; i < tree.children.length; ++i) {
      cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
    }

    /**
     * rectWidth --> this variable is used to store the current total width of the rectangle
     * rectHeight --> this variable is used to store the current total height of the rectangle
     */
    let rectWidth = rect.x2 - rect.x1;
    let rectHeight = rect.y2 - rect.y1;
    let border = 5;

    let scale = d3.scaleLinear()
      .domain([0, cumulativeSizes[cumulativeSizes.length - 1]]);

    /**
     * Adjusting the border value based on the space available in the rectangle. The default value of the border is 5, if the rectangle width or height is less than 10, then the border will be reduced.
     */
    if (rectHeight <= 10) {
      border = rectHeight / 3;
    }
    else if (rectWidth <= 10) {
      border = rectWidth / 3;
    }

    /**
     * Creating scale based on the depth of the node in the tree. if the depth is a multiple of 2, then the scale will be adjusted as per the x-axis else the scale will be y-axis.
     */
    if (tree.depth % 2 == 0) {
      // Vertical scale
      scale = d3.scaleLinear()
        .domain([0, cumulativeSizes[cumulativeSizes.length - 1]])
        .range([rect.x1, rect.x2 - border * 2]);
    } else {
      // Horizontal scale
      scale = d3.scaleLinear()
        .domain([cumulativeSizes[cumulativeSizes.length - 1], 0])
        .range([rect.y2 - border * 2, rect.y1]);
    }

    /**
     * Below logic is checking the scale and creating rectangles for all the children recursively. The scale is being picked based on the depth of the node.
     */
    for (let i = 0; i < tree.children.length; ++i) {
      /**
       * Loccal variable to set the cordinates of the rectangle
       */
      let newRect = { x1: 0, x2: 0, y1: 0, y2: 0 };

      if (scale.domain()[0] > scale.domain()[1]) {
        // Horizontal
        /**
         * Calling the scale defined above to get the normalized x and y cordinates of the rectangle
         * scale(cumulativeSizes[i + 1]) - scale(cumulativeSizes[i]) --> this will give me the actual size of the current child.
         */
        newRect = {
          x1: rect.x1 + border,
          x2: rect.x2 - border,
          y1: scale(cumulativeSizes[i]) + border,
          y2: scale(cumulativeSizes[i + 1]) + border
        };

      } else {
        // Vertical
        /**
         * Calling the scale defined above to get the normalized x and y cordinates of the rectangle
         * scale(cumulativeSizes[i + 1]) - scale(cumulativeSizes[i]) --> this will give me the actual size of the current child.
         */
        newRect = {
          x1: scale(cumulativeSizes[i]) + border,
          x2: scale(cumulativeSizes[i + 1]) + border,
          y1: rect.y1 + border,
          y2: rect.y2 - border
        };
      }

      /**
       * Recursive call to define the cordinates to the children of the current node
       */
      setRectangles(newRect, tree.children[i], attrFun);
    }
  }
}


////////////////////////////////////////////////////////////////////////
/**
 * Callback function to show the visualization of the Best Count and Best Size of the treemap.
 * 
 * @param {*} rect --> contains the rect of the current node
 * @param {*} tree --> current node
 * @param {*} attrFun --> Function passed to get Count or Size values of the nodes
 */
function setRectangles_Best(rect, tree, attrFun) {
  tree.rect = rect;

  /**
   * Calculating the cummulative sum of the size of each children.
   */
  if (tree.children !== undefined) {
    let cumulativeSizes = [0];
    /**
     * Calculating the cummulative sum of the size of each children.
     */
    for (let i = 0; i < tree.children.length; ++i) {
      cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
    }

    /**
     * rectWidth --> this variable is used to store the current total width of the rectangle
     * rectHeight --> this variable is used to store the current total height of the rectangle
     */
    let rectWidth = rect.x2 - rect.x1;
    let rectHeight = rect.y2 - rect.y1;
    let border = 5;

    /**
     * Adjusting the border value based on the space available in the rectangle. The default value of the border is 5, if the rectangle width or height is less than 10, then the border will be reduced.
     */
    if (rectHeight <= 10) {
      border = rectHeight / 3;
    }
    else if (rectWidth <= 10) {
      border = rectWidth / 3;
    }

    let scale = d3.scaleLinear()
      .domain([0, cumulativeSizes[cumulativeSizes.length - 1]]);

    /**
     * Creating scale based on the width and height of the rectangle. if the width is greater than height, then the scale will be adjusted as per the x-axis else the scale will be y-axis.
     */
    if (rectWidth > rectHeight) {
      // Vertical scale
      scale = d3.scaleLinear()
        .domain([0, cumulativeSizes[cumulativeSizes.length - 1]])
        .range([rect.x1, rect.x2 - border * 2]);
    } else {
      // Horizontal scale
      scale = d3.scaleLinear()
        .domain([cumulativeSizes[cumulativeSizes.length - 1], 0])
        .range([rect.y2 - border * 2, rect.y1]);
    }

    /**
     * Below logic is checking the scale and creating rectangles for all the children recursively. The scale is being picked based on the width and height of the rectangle, whichever is greater is picked as first.
     */
    for (let i = 0; i < tree.children.length; ++i) {
      /**
       * Loccal variable to set the cordinates of the rectangle
       */
      let newRect = { x1: 0, x2: 0, y1: 0, y2: 0 };

      if (scale.domain()[0] > scale.domain()[1]) {
        // Horizontal
        /**
         * Calling the scale defined above to get the normalized x and y cordinates of the rectangle
         * scale(cumulativeSizes[i + 1]) - scale(cumulativeSizes[i]) --> this will give me the actual size of the current child.
         */
        newRect = {
          x1: rect.x1 + border,
          x2: rect.x2 - border,
          y1: scale(cumulativeSizes[i]) + border,
          y2: scale(cumulativeSizes[i + 1]) + border
        };
      } else {
        // Vertical
        /**
         * Calling the scale defined above to get the normalized x and y cordinates of the rectangle
         * scale(cumulativeSizes[i + 1]) - scale(cumulativeSizes[i]) --> this will give me the actual size of the current child.
         */
        newRect = {
          x1: scale(cumulativeSizes[i]) + border,
          x2: scale(cumulativeSizes[i + 1]) + border,
          y1: rect.y1 + border,
          y2: rect.y2 - border
        };
      }

      /**
       * Recursive call to define the cordinates to the children of the current node
       */
      setRectangles_Best(newRect, tree.children[i], attrFun);
    }
  }
}




////////////////////////////////////////////////////////////////////////
// Callbacks for buttons

d3.select("#size").on("click", function () {
  setRectangles(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }
  );
  d3.select("#svg_a04").selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#count").on("click", function () {
  setRectangles(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.count; }
  );
  d3.select("#svg_a04").selectAll("rect").transition().duration(1000).call(setAttrs);
});

/**
 * Callback functions added for the buttons of Best count and size Treemap
 */
d3.select("#best-size").on("click", function () {
  setRectangles_Best(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }
  );
  d3.select("#svg_a04").selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#best-count").on("click", function () {
  setRectangles_Best(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.count; }
  );
  d3.select("#svg_a04").selectAll("rect").transition().duration(1000).call(setAttrs);
});
