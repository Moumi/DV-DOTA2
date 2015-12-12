var windowWidth = 500;
var windowHeight = 500;

var margin = {top: 15, right: 15, bottom: 50, left: 15};
var viewWidth = windowWidth/3 - margin.left - margin.right;
var viewHeight = windowHeight - margin.top - margin.bottom;

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
    
var histogram = d3.select("#histogram")
    .style("float", "left")
  .select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g");



function resize() {
  
  console.log("resize");
  
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  d3.select("#container")
    .attr("width", viewWidth);

  var vw = windowWidth/3 - margin.left - margin.right;
  var vh = windowHeight - margin.top - margin.bottom;

  viewWidth = Math.min(vw, vh);
  viewHeight = viewWidth;

  d3.selectAll("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

  d3.select("#scatterplotSelectionUI")
  	.selectAll("select")
    .style("width", viewWidth/4.5+"px");
  
  // resizeScatterplot();
  resizeGeoplot();
  // resizeHistogram();
}


function fill_combobox() {
	var select = document.getElementById("matchBox");
	for(var i = 0; i < matches.length; i++) {
            var opt = matches[i];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
	}
	select.selectedIndex = 0;
}

fill_combobox()
//resize();
d3.select(window).on("resize", resize);