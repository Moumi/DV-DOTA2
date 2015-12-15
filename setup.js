var windowWidth = 500;
var windowHeight = 500;

var margin = {top: 15, right: 15, bottom: 50, left: 15};
var viewWidth = windowWidth/2 - margin.left - margin.right;
var viewHeight = windowHeight - margin.top - margin.bottom;

var timeFrame = [370, 430];

var scatterplot = d3.select("#scatterplot")
    .style("float", "left")
  .select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g");
    
var geoplot = d3.select("#geoplot")
    .style("float", "left")
  .select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g");

var initLoaded = false;
function resize() {  
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  d3.select("#container")
    .attr("width", viewWidth);

  var vw = windowWidth/2 - margin.left - margin.right;
  var vh = windowHeight - margin.top - margin.bottom;

  viewWidth = Math.min(vw, vh);
  viewHeight = viewWidth;

  d3.selectAll("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

  d3.select("#scatterplotSelectionUI")
  	.selectAll("select")
    .style("width", viewWidth/4.5+"px");

  if (!initLoaded) {
    init();
  } else {
    resize(true);
  }
}

function init() {
  if (typeof resizeGeoplot !== 'undefined') {
    initLoaded = true;
  } else {
    setTimeout(init, 100);
  }
}


resize(true);
d3.select(window).on("resize", resize);