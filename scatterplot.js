var scatterPlotMargin = {top: 20, right: 20, bottom: 30, left: 40};
var scWidth = viewWidth - scatterPlotMargin.left - scatterPlotMargin.right;
var scHeight = viewHeight - scatterPlotMargin.top - scatterPlotMargin.bottom;

var x = d3.scale.linear()
    .range([0, scWidth]);

var y = d3.scale.linear()
    .range([scHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var scatterPlotSvg = d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  .append("g")
    .attr("transform", "translate(" + scatterPlotMargin.left + "," + scatterPlotMargin.top + ")");

var defs = scatterPlotSvg.append( "defs" );
    
var line;

function drawScatterplot() {
	
  var xExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.tsync });
  var yExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.DD }); 

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  
  scatterPlotSvg.selectAll("g").remove();
  scatterPlotSvg.selectAll(".line").remove();

  scatterPlotSvg.append("g")
      .attr("id", "xAxis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + scHeight + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "xLabel")
      .attr("x", scWidth)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("tsync");

  scatterPlotSvg.append("g")
      .attr("id", "yAxis")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "yLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Inter-team Distance");

    line = d3.svg.line()
             .x(function(d){return x(d.tsync) }) //+(d.tsync));})
             .y(function(d){return y(d.DD) })  //d3.format(".3f")(d.DD));})
             .interpolate("basis"); 
      
  scatterPlotSvg.append("svg:path")
      .attr("class", "line")
      .attr("d", line(distanceData['radiant']))
      .attr("data-legend", "radiant")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .style("fill", "none");

  scatterPlotSvg.append("svg:path")
    .attr("class", "line")
    .attr("d", line(distanceData['dire']))
    .attr("data-legend", "dire")
      .style("stroke-width", 1)
      .style("stroke", "red")
      .style("fill", "none");
      
  var legend = scatterPlotSvg.append("g")
      .attr("class", "legend");

  legend.append("rect")
      .attr("x", scWidth - 18)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "green");

  legend.append("text")
      .attr("x", scWidth - 22)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Radiant");
      
  legend.append("rect")
      .attr("x", scWidth - 18)
      .attr("y", 30)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "red");
      
  legend.append("text")
      .attr("x", scWidth - 22)
      .attr("y", 36)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Dire");
}

function updatePoints() {
  /*
  var xExtent = d3.extent(boat_data.boats, function(d) { return d[v1]; });
  var yExtent = d3.extent(boat_data.boats, function(d) { return d[v2]; });
  var zExtent = d3.extent(boat_data.boats, function(d) { return d[v3]; });

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  color.domain(zExtent);
  
  d3.select("#xLabel").text(dataName(v1));
  d3.select("#yLabel").text(dataName(v2));
  d3.select("#colorLabel").text(dataName(v3));
  
  d3.select("#xAxis").call(xAxis);
  d3.select("#yAxis").call(yAxis);
  
  points.transition()
    .duration(750)
    .ease("cubic")
    .attr("cx", function(d) { return x(d[v1]); })
    .attr("cy", function(d) { return y(d[v2]); })
    .style("fill", function(d) { return color(d[v3]); });
  */
}

function resizeScatterplot() {

  scWidth = viewWidth - scatterPlotMargin.left - scatterPlotMargin.right;
  scHeight = viewHeight - scatterPlotMargin.top - scatterPlotMargin.bottom;

  x.range([0, scWidth]);
  y.range([scHeight, 0]);

  xAxis.scale(x);
  yAxis.scale(y);
  
  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);
  

  drawScatterplot();
}