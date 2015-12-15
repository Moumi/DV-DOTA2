var linePlotMargin = {top: 20, right: 20, bottom: viewHeight - ( (3/4)*viewHeight), left: 40};
var selectionPlotMargin = {top: viewHeight - ( (1/6)*viewHeight), right: 20, bottom: 20, left: 40};
var lpWidth = viewWidth - linePlotMargin.left - linePlotMargin.right;
var lpHeight = viewHeight - linePlotMargin.top - linePlotMargin.bottom;
var lpHeight2 = viewHeight - selectionPlotMargin.top - selectionPlotMargin.bottom;

var xExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.tsync });
var yExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.DD }); 

var timeFrame = [0,120];

var x = d3.scale.linear()
    .domain(xExtent).nice()
    .range([0, lpWidth]);

var y = d3.scale.linear()
    .domain(yExtent).nice()
    .range([lpHeight, 0]);
    
var x2 = d3.scale.linear()
    .domain(x.domain())
    .range([0, lpWidth]);

var y2 = d3.scale.linear()
    .domain(y.domain())
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
    .extent(timeFrame)
    .on("brush", brushed);

var scatterPlotSvg = d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);

var focus = scatterPlotSvg.append("g")
    .attr("player", "focus")
    .attr("transform", "translate(" + linePlotMargin.left + "," + linePlotMargin.top + ")");

var context = scatterPlotSvg.append("g")
    .attr("player", "context")
    .attr("transform", "translate(" + selectionPlotMargin.left + "," + selectionPlotMargin.top + ")");

var defs = scatterPlotSvg.append( "defs" ).append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", lpWidth)
    //.attr("width", window.innerWidth/2 - selectionPlotMargin.left - selectionPlotMargin.right - 40) // Don't want to hard-code this, but d3 left me no choice
    .attr("height", viewHeight);
    //console.log(window.innerWidth);

var line = d3.svg.line()
             .x(function(d){return x(d.tsync) }) //+(d.tsync));})
             .y(function(d){return y(d.DD) })  //d3.format(".3f")(d.DD));})
             .interpolate("basis"); 

var line2 = d3.svg.line()
             .x(function(d){return x2(d.tsync) }) //+(d.tsync));})
             .y(function(d){return y2(d.DD) })  //d3.format(".3f")(d.DD));})
             .interpolate("basis"); 

var firstTime = true;
function drawScatterplot(resetDomain = false) {
  if(resetDomain) {
    xExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.tsync });
    yExtent = d3.extent(distanceData['radiant'].concat(distanceData['dire']), function(d) { return d.DD }); 
    x2.domain(xExtent).nice();
    y2.domain(yExtent).nice();
  }

  focus.selectAll("g").remove();
  focus.selectAll(".line").remove();
  focus.selectAll(".line2").remove();
  
  context.selectAll("g").remove();
  context.selectAll(".line").remove();
  context.selectAll(".line2").remove();

  focus.append("g")
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

  focus.append("g")
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

  focus.append("path")
      .attr("class", "line")
      .attr("d", line(distanceData['radiant']))
      .attr("data-legend", "radiant")
      .attr("clip-path", "url(#clip)")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .style("fill", "none");

  focus.append("path")
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
    context.append("path")
      .attr("class", "line")
      .attr("d", line2(distanceData['radiant']))
      .attr("data-legend", "radiant")
      .attr("clip-path", "url(#clip)")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .style("fill", "none");

      
  context.append("path")
    .attr("class", "line2")
    .attr("d", line2(distanceData['dire']))
    .attr("data-legend", "dire")
    .attr("clip-path", "url(#clip)")
      .style("stroke-width", 1)
      .style("stroke", "red")
      .style("fill", "none");
      
      
      context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", lpHeight2 + 7);
      
  var legend = focus.append("g")
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

brushed();
function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select(".line").attr("d", line(distanceData['radiant']));
  focus.select(".line2").attr("d", line(distanceData['dire']));
  focus.select(".x.axis").call(xAxis);
  timeFrame = brush.extent();

  // Redraw
  if (typeof draw_heatmap !== 'undefined') {
    redraw();
  }
}

function resizeScatterplot() {
  firstTime = false;
  linePlotMargin = {top: 20, right: 20, bottom: viewHeight - ( (3/4)*viewHeight), left: 40};
  selectionPlotMargin = {top: viewHeight - ( (1/6)*viewHeight), right: 20, bottom: 20, left: 40};
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
  
  defs
    .attr("width", lpWidth);
  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);
  focus
    .attr("transform", "translate(" + linePlotMargin.left + "," + linePlotMargin.top + ")");
  context
    .attr("transform", "translate(" + selectionPlotMargin.left + "," + selectionPlotMargin.top + ")");
  brush
    .extent(timeFrame);

  drawScatterplot();
}