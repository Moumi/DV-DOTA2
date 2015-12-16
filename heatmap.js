function getObject(data, x, y) {
  for (var z in data) {
    var element = data[z];
    if (element.x === x && element.y === y) {
      return element;
    }
  }
  return null;
}

var startPos = 0; var range = 125; var steps = 5; var binSize = Math.floor(range / steps);
function index_(x, y) {
  var xPos = Math.floor((x - startPos) / range * binSize);
  var yPos = Math.floor((y - startPos) / range * binSize);
  return xPos + (binSize * yPos);
}

var legendDrawn = false;
function draw_heatmap() {
  if(show_heatmap) {
    init(); 
    var temp = document.getElementById("scatterplot");
    temp.style.marginBottom = "-2px";
    draw_heatmap_rects();
    // if (!legendDrawn) {
      draw_heatmap_legend();
      // legendDrawn = true;
    // }
  }
}

function draw_heatmap_rects() {
  geoplotSvg.selectAll('.unit').remove();

  var dataHeatmap = [];
  for (var tsync in heatmapData) {
    if (tsync >= timeFrame[0] && tsync <= timeFrame[1]) {
      var dataTsync = heatmapData[tsync]; // array of tsync
      for (var element in dataTsync) { // iterate over array
        dataHeatmap.push(dataTsync[element]); // push element seperately
      }
    }
  }

  var data_ = [];
  for (var k in dataHeatmap) {
    var e = dataHeatmap[k];
    var obj = getObject(data_, e.x, e.y);
    if (obj != null) {
      obj.count += e.count;
    } else {
      data_.push(e);
    }
  }

  var binData = []; 
  for (var x = startPos; x < range; x += steps) {
    for (var y = startPos; y < range; y += steps) {
      binData.push({"x": x, "y": y, "count": 0});
    }
  }

  data_.forEach(function(d) {
    var idx = index_(d.x, d.y);
    binData[idx].count += d.count;
  });

  binData = binData.filter(function(d) {
    return d.count != 0;
  })
  
  var rects = geoplotSvg.selectAll("rect")
    .data(binData);

  var minCount = d3.min(binData, function(d) { return d.count; });
  var maxCount = d3.max(binData, function(d) { return d.count; });
  var colorScale = d3.scale.linear()
    .domain([(maxCount / binData.length), 0, maxCount])
    .range(["blue", "white", "red"]);

  var attrScale = d3.scale.linear()
    .domain([0, range])
    .range([0, viewHeight]);

  rects.enter()
    .append("rect")
      .attr("class", "unit")
      .attr("y", function(d) { return geoY(d.x) - attrScale(steps) + 1; })
      .attr("x", function(d) { return geoX(d.y) - (attrScale(steps) / 10); })
      .attr("count", function(d) { return d.count; })
      .attr("width", attrScale(steps))
      .attr("height", attrScale(steps))
      .style("fill", function(d) {
        return colorScale(d.count);
      })
      .style("opacity", function(d) { if (d.count == 0) return 0; else return 0.7; });
}

function draw_heatmap_legend() {
  d3.selectAll(".legend").remove();
  d3.selectAll("#geoLegendGradient").remove();

  var defs = geoplotSvg.select( "defs" );
  var legendMargin = {top: 6, right: 2};

  var legendGradient = defs.append( "linearGradient" )
      .attr( "id", "geoLegendGradient" )
      .attr( "x1", "0" )
      .attr( "x2", "0" )
      .attr( "y1", "1" )
      .attr( "y2", "0" );

  legendGradient.append( "stop" )
      .attr( "id", "gradientStart" )
      .attr( "offset", "0%" )
      .style( "stop-opacity", 1);

  legendGradient.append( "stop" )
      .attr( "id", "gradientStop" )
      .attr( "offset", "100%" )
      .style( "stop-opacity", 1);

    geoplotSvg.select("#gradientStart")
      .style("stop-color", "white");
    geoplotSvg.select("#gradientStop")
      .style("stop-color", "red");

    var legend = geoplotSvg.append("g")
      .attr("class", "legend");

  legend.append("rect")
      .attr("x", legendMargin.right)
      .attr("y", legendMargin.top - 5)
      .attr("width", 50)
      .attr("height", 52)
      .style("fill", "white")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("opacity", 0.8);

  legend.append("rect")
      .attr("x", legendMargin.right + 25)
      .attr("y", legendMargin.top)
      .attr("width", 20)
      .attr("height", 40)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("fill", "url(#geoLegendGradient)");

    legend.append("text")
      .attr("x", legendMargin.right + 22)
      .attr("y", 5 + legendMargin.top)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("high");

    legend.append("text")
      .attr("x", legendMargin.right + 22)
      .attr("y", 35 + legendMargin.top)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("low");
}

function resizeHeatmap() {
  if(show_heatmap) {
    d3.select("#heatmap").select("svg")
      .attr("width", viewWidth)
      .attr("height", viewHeight)
      
    draw_background("#geoplot");
    draw_heatmap();
  }
}

function removeHeatmap() {
  geoplotSvg.selectAll('.unit').remove();
  geoplotSvg.selectAll("#geoLegendGradient").remove();
  legendDrawn = false;
}