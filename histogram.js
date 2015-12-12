var histogramSvg = d3.select("#histogram").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  .append("g")
    .attr("transform", "translate(" + viewWidth/2 + "," + viewHeight/2 + ")");

var barHeight = Math.min(viewWidth, viewHeight) / 2 - 50;

var formatNumber = d3.format("s");

var innerWhiteSpaceFraction = 0.25;
var numBins = parseInt(document.getElementById("numBins").value);

var angles = []; angles.length = boat_data.boats.length;
for (var i = 0; i < angles.length; i++)
{    
	var angle = Math.atan2(-boat_data.boats[i].v,boat_data.boats[i].u);
	if(angle < 0){
		angle = 2*Math.PI + angle;
	}
  angles[i] = angle * 180 / Math.PI;
}


function drawHistogram() {
  
  histogramSvg.selectAll('*').remove();
 
  var data = d3.layout.histogram()
    .bins(numBins)
    (angles);

  var extent = d3.extent(data, function(d) { return d.length; });
  var barScale = d3.scale.linear()
      .domain(extent)
      .range([0, barHeight]);
      //.range([barHeight,barHeight*innerWhiteSpaceFraction]);

  var keys = data.map(function(d,i) { var min = 360*(i/data.length); var max = 360*((i+1)/data.length); return ((min + max) / 2).toFixed(1) + "\xB0"; });
  var numBars = data.length;

  var x = d3.scale.linear()
      .domain(extent)
      .range([0, -barHeight]);
      //.range([-barHeight, -barHeight*innerWhiteSpaceFraction]);

  var xAxis = d3.svg.axis()
      .scale(x).orient("left")
      .ticks(3)
      .tickFormat(formatNumber);
      
  var circles = histogramSvg.selectAll("circle")
          .data(x.ticks(3))
        .enter().append("circle")
          .attr("r", function(d) {return barScale(d);})
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-dasharray", "2,2")
          .style("stroke-width",".5px");

  var arc = d3.svg.arc()
      .startAngle(function(d,i) { return (i * 2 * Math.PI) / numBars; })
      .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / numBars; })
      .innerRadius(0);
      //.outerRadius(barHeight);
  
  var segments = histogramSvg.selectAll("path")
          .data(data)
        .enter().append("path")
          .each(function(d) { d.outerRadius = barScale(d.length); })
          //.each(function(d) { d.innerRadius = barScale(d.length); })
          .style("fill", "#6960EC")
          .attr("d", arc)
      		.on("mouseover", function() {
      			d3.select(this).style("fill", "#342D7E");
      		})
      		.on("mouseout", function() {
      			d3.select(this).style("fill", "#6960EC");
      		});


  var lines = histogramSvg.selectAll("line")
      .data(keys)
    .enter().append("line")
      //.attr("y1", -barHeight*innerWhiteSpaceFraction)
      .attr("y2", -barHeight - 20)
      .style("stroke", "black")
          .style("stroke-width",".25px")
      .attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });
      
    histogramSvg.append("g")
      .attr("class", "x axis")
      .call(xAxis);

  // Labels
  var labelRadius = barHeight * 1.025;

  var labels = histogramSvg.append("g")
      .classed("labels", true);

  labels.append("def")
        .append("path")
        .attr("id", "label-path")
        .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

  labels.selectAll("text")
        .data(keys)
      .enter().append("text")
        .style("text-anchor", "middle")
        .append("textPath")
        .attr("xlink:href", "#label-path")
        .attr("startOffset", function(d, i) {return i * 100 / numBars + 50 / numBars + '%';})
        .text(function(d) {return d; });
}

function resizeHistogram() {
  
  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  
  histogramSvg.attr("transform", "translate(" + viewWidth/2 + "," + viewHeight/2 + ")");
  
  barHeight = Math.min(viewWidth, viewHeight) / 2 - 40;

  drawHistogram();
}

function setNumberOfBins() {
  numBins = parseInt(document.getElementById("numBins").value);
  console.log(numBins);
  drawHistogram();
}