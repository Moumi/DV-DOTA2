var linePlotMargin = {top: 20, right: 20, bottom: 100, left: 40};
var selectionPlotMargin = {top: 615, right: 20, bottom: 20, left: 40};
var lpWidth = viewWidth - linePlotMargin.left - linePlotMargin.right;
var lpHeight = viewHeight - linePlotMargin.top - linePlotMargin.bottom;
var lpHeight2 = viewHeight - selectionPlotMargin.top - selectionPlotMargin.bottom;

var x = d3.scale.linear()
    .range([0, lpWidth]);

var y = d3.scale.linear()
    .range([lpHeight, 0]);
    
var x2 = d3.scale.linear()
    .range([0, lpWidth]);

var y2 = d3.scale.linear()
    .range([lpHeight2, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
var xAxis2 = d3.svg.axis()
     .scale(x2)
     .orient("bottom")

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    
var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var scatterPlotSvg = d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  .append("g")
    .attr("transform", "translate(" + linePlotMargin.left + "," + linePlotMargin.top + ")");

var context = d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  .append("g")
    .attr("transform", "translate(" + selectionPlotMargin.left + "," + selectionPlotMargin.top + ")");

var defs = scatterPlotSvg.append( "defs" ).append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", window.innerWidth/2 - selectionPlotMargin.left - selectionPlotMargin.right - 40) // Don't want to hard-code this, but d3 left me no choice
    .attr("height", window.innerHeight);
    console.log(window.innerWidth);

var line = d3.svg.line()
             .x(function(d){return x(d.tsync) }) //+(d.tsync));})
             .y(function(d){return y(d.DD) })  //d3.format(".3f")(d.DD));})
             .interpolate("basis"); 

var line2 = d3.svg.line()
             .x(function(d){return x2(d.tsync) }) //+(d.tsync));})
             .y(function(d){return y2(d.DD) })  //d3.format(".3f")(d.DD));})
             .interpolate("basis"); 

function drawScatterplot() {
	
  var xExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.tsync });
  var yExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.DD }); 

  x.domain(xExtent)//.nice();
  y.domain(yExtent)//.nice();
  x2.domain(x.domain());
  y2.domain(y.domain());
  
  scatterPlotSvg.selectAll("g").remove();
  scatterPlotSvg.selectAll(".line").remove();
  scatterPlotSvg.selectAll(".line2").remove();
  
  context.selectAll("g").remove();
  context.selectAll(".line").remove();
  context.selectAll(".line2").remove();

  scatterPlotSvg.append("g")
      .attr("id", "xAxis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + lpHeight + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "xLabel")
      .attr("x", lpWidth)
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

  scatterPlotSvg.append("path")
      .attr("class", "line")
      .attr("d", line(distanceData['radiant']))
      .attr("data-legend", "radiant")
      .attr("clip-path", "url(#clip)")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .style("fill", "none");

  scatterPlotSvg.append("path")
    .attr("class", "line2")
    .attr("d", line(distanceData['dire']))
    .attr("data-legend", "dire")
    .attr("clip-path", "url(#clip)")
      .style("stroke-width", 1)
      .style("stroke", "red")
      .style("fill", "none");

      
  context.append("g")
      .attr("id", "xAxis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + lpHeight2 + ")")
      .call(xAxis2)
    .append("text")
      .attr("class", "label")
      .attr("id", "xLabel")
      .attr("x", lpWidth)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("tsync");
/*
  context.append("g")
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
*/      
    context.append("svg:path")
      .attr("class", "line")
      .attr("d", line2(distanceData['radiant']))
      .attr("data-legend", "radiant")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .style("fill", "none");

      
  context.append("svg:path")
    .attr("class", "line2")
    .attr("d", line2(distanceData['dire']))
    .attr("data-legend", "dire")
      .style("stroke-width", 1)
      .style("stroke", "red")
      .style("fill", "none");
      
      
      context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", lpHeight2 + 7);
      
  var legend = scatterPlotSvg.append("g")
      .attr("class", "legend");

  legend.append("rect")
      .attr("x", lpWidth - 18)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "green");

  legend.append("text")
      .attr("x", lpWidth - 22)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Radiant");
      
  legend.append("rect")
      .attr("x", lpWidth - 18)
      .attr("y", 30)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "red");
      
  legend.append("text")
      .attr("x", lpWidth - 22)
      .attr("y", 36)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Dire");
}


function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  scatterPlotSvg.select(".line").attr("d", line(distanceData['radiant']));
  scatterPlotSvg.select(".line2").attr("d", line(distanceData['dire']));
  scatterPlotSvg.select(".x.axis").call(xAxis);
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
  lpWidth = viewWidth - linePlotMargin.left - linePlotMargin.right;
  lpHeight = viewHeight - linePlotMargin.top - linePlotMargin.bottom;
  lpHeight2 = viewHeight - selectionPlotMargin.top - selectionPlotMargin.bottom;

  x.range([0, lpWidth]);
  y.range([lpHeight, 0]);
  x2.range([0, lpWidth])
  y2.range([lpHeight2, 0]);

  xAxis.scale(x);
  yAxis.scale(y);
  xAxis2.scale(x2);
  
  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);

  drawScatterplot();
}