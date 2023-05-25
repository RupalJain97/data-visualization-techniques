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

// HINT: Start with one of the smaller test datesets included in
// test-cases.js instead of the larger tree in flare.js
data = flare;



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
let Treesize = setTreeSize(data);
setTreeCount(data);


// let maxDepth = setTreeDepth(data, 0);  --> original line
/**
 * Setted the maxdepth to zero, and then calling the setTreeDepth function to mark the dept of each node. Root has depth as 0 and the leaf nodes have the maximum depth.
 */
let maxDepth = 0;
let depth = setTreeDepth(data, 0, maxDepth);

/**
 * Colorscale defined and interpolatePurples color has been used for good visualization
 */
let colorScale = d3.scaleSequential()
  .domain([maxDepth, 0])
  .interpolator(d3.interpolatePurples);


////////////////////////////////////////////////////////////////////////
// Main Code for the Treemapping Technique

let scale = null;

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
/**
 * Callback function to show the visualization of Squarified treemap.
 * 
 * @param {*} rect --> contains the rect of the current node
 * @param {*} tree --> current node
 * @param {*} attrFun --> Function passed to get Count or Size values of the nodes
 * @param {*} totalAreaLeft --> contains the total size or count
 */
let lastRect = { x1: 0, y1: 0, x2: 0, y2: 0 };

function setRectangle_Square(rect, tree, attrFun, totalAreaLeft) {
  tree.rect = rect;

  /**
   * Function to calculate the Aspect ratio based on Widht and Height
   */
  function calculateAspectRatio(size, currentRow, width, height, totalAreaLeft) {
    if (width > height) {
      const rowArea = currentRow.reduce((sum, node) => sum + attrFun(node), 0);
      let Height = (size / rowArea) * height;
      let Width = (rowArea / totalAreaLeft) * width;
      const aspectRatio = Math.max((Height / Width), (Width / Height));
      return aspectRatio;
    } else {
      const rowArea = currentRow.reduce((sum, node) => sum + attrFun(node), 0);
      let Width = (size / rowArea) * width;
      let Height = (rowArea / totalAreaLeft) * height;
      const aspectRatio = Math.max((Height / Width), (Width / Height));
      return aspectRatio;
    }
  }


  if (tree.children !== undefined) {
    /**
     * Sorting the array
     */
    tree.children.sort(function (a, b) {
      return attrFun(b) - attrFun(a);
    });

    let border = 5;
    let currentRow = [];
    let currentAspectRatio = 0;
    let newRect = rect;
    let rowHeight = newRect.y2 - newRect.y1;
    let rowWidth = newRect.x2 - newRect.x1;

    if ((newRect.y2 - newRect.y1) <= 10) {
      border = (newRect.y2 - newRect.y1) / 3;
    }
    else if ((newRect.x2 - newRect.x1) <= 10) {
      border = (newRect.x2 - newRect.x1) / 3;
    }

    let i = 0;
    while (i != tree.children.length) {

      rowHeight = newRect.y2 - newRect.y1;
      rowWidth = newRect.x2 - newRect.x1;
      let size = attrFun(tree.children[i]);
      currentRow.push(tree.children[i]);
      let aspectRatio = calculateAspectRatio(size, currentRow, rect.x2 - rect.x1, rect.y2 - rect.y1, attrFun(tree));

      if ((currentAspectRatio !== 0 && aspectRatio <= currentAspectRatio && i == tree.children.length - 1)
        || (currentAspectRatio !== 0 && aspectRatio > currentAspectRatio)
        || (currentAspectRatio == 0 && i == tree.children.length - 1)) {

        if (currentAspectRatio != 0) {
          const lastChild = currentRow.pop();
        }
        if (currentAspectRatio == 0 && i == tree.children.length - 1) {
          i++;
        }

        const rowArea = currentRow.reduce((sum, node) => sum + attrFun(node), 0);

        let lastrectWidth = 0;
        let lastrectHeight = 0;

        for (let j = 0; j < currentRow.length; j++) {

          let size = attrFun(currentRow[j]);
          let dept = currentRow[j].depth;
          if (rowWidth > rowHeight) {

            let Width = Math.ceil((rowArea / totalAreaLeft) * (rowWidth - border));
            let Height = Math.ceil((size / rowArea) * (rowHeight - border));

            currentRow[j].rect = {
              x1: newRect.x1 + border,
              x2: newRect.x1 + Width,
              y1: newRect.y1 == 0 ? (lastrectHeight == 0 ? newRect.y1 + lastrectHeight + border : newRect.y1 + lastrectHeight) : newRect.y1 + lastrectHeight +border,
              y2: newRect.y1 + lastrectHeight + Height
            };

            lastrectWidth = Width;
            lastrectHeight = Height;

          } else {

            let Height = Math.ceil((rowArea / totalAreaLeft) * (rowHeight - border));
            let Width = Math.ceil((size / rowArea) * (rowWidth - border));

            currentRow[j].rect = {
              x1: newRect.x1 + lastrectWidth + border,
              x2: lastrectWidth == 0 ? newRect.x1 + lastrectWidth + Width : rect.x1 + lastrectWidth + Width + border,
              y1: newRect.y1 + border,
              y2: newRect.y1 + Height
            };

            lastrectWidth = Width;
            lastrectHeight = Height;
          }

        }

        lastRect = currentRow[currentRow.length - 1].rect;

        if (rowWidth > rowHeight) {
          newRect = { x1: newRect.x1 + lastrectWidth - border, y1: newRect.y1, x2: newRect.x2, y2: newRect.y2 };
          rowWidth -= lastrectWidth;
        } else {
          newRect = { x1: newRect.x1, y1: newRect.y1 + lastrectHeight, x2: newRect.x2, y2: newRect.y2 };
          rowHeight -= lastrectHeight;
        }

        totalAreaLeft -= rowArea;
        currentRow = [];
        currentAspectRatio = 0;

      } else {
        currentAspectRatio = aspectRatio;
        i++;
      }
    }
  }

  // Set the rectangles for the children in the current row
  for (let j = 0; j < tree.children.length; j++) {
    const child = tree.children[j];
    if (child.children !== undefined) {
      const child = tree.children[j];
      let childHeight = child.rect.y2 - child.rect.y1;
      let childWidth = child.rect.x2 - child.rect.x1;
      setRectangle_Square(child.rect, child, attrFun, attrFun(child));
    }
  }
}


// initialize the tree map
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;

// compute the rectangles for each tree node
setRectangles(
  { x1: 0, y1: 0, x2: winWidth, y2: winHeight }, data,
  function (t) { return t.size; }
);

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
makeTreeNodeList(data, treeNodeList);
console.log(treeNodeList)


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion

// d3 selection to draw the tree map 
let gs = d3.select("#svg_a04")
  .attr("width", winWidth)
  .attr("height", winHeight)
  .selectAll("g")
  .data(treeNodeList)
  .enter()
  .append("g");


/**
 * set the visual attributes of each rect. This should use all of the information that you’ve inserted in the tree through the four “set” functions.
 */
function setAttrs(sel) {
  // TODO: WRITE THIS PART.
  sel.attr("width", function (treeNode) { return treeNode.rect.x2 - treeNode.rect.x1; })
    .attr("height", function (treeNode) { return treeNode.rect.y2 - treeNode.rect.y1; })
    .attr("x", function (treeNode) { return treeNode.rect.x1; })
    .attr("y", function (treeNode) { return treeNode.rect.y1; })
    .attr("fill", function (treeNode) { return colorScale(treeNode.depth) })
    .attr("stroke", function (treeNode) { return "Black"; });
}

gs.append("rect").call(setAttrs);

gs.select("rect").append("title")
  .text(function (treeNode) {
    return treeNode.name;
  });

////////////////////////////////////////////////////////////////////////
// Callbacks for buttons

d3.select("#size").on("click", function () {
  setRectangles(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#count").on("click", function () {
  setRectangles(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.count; }
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

/**
 * Callback functions added for the buttons of Best count and size Treemap
 */
d3.select("#best-size").on("click", function () {
  setRectangles_Best(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#best-count").on("click", function () {
  setRectangles_Best(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.count; }
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

/**
 * Callback functions added for the buttons of Squarified Treemap
 */
d3.select("#square-size").on("click", function () {
  var data_square = data;
  setRectangle_Square(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }, data.size
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);

  data = data_square;
});

d3.select("#square-count").on("click", function () {
  setRectangle_Square(
    { x1: 0, x2: winWidth, y1: 0, y2: winHeight }, data,
    function (t) { return t.size; }, data.count
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});