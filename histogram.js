var heatmapSvg = d3.select("#heatmap").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);

function drawHeatmap() {
  var minCount = heatmapData[1].min;
  var maxCount = heatmapData[2].max;
  var data_ = heatmapData[0][Object.keys(heatmapData[0])].filter(function(d) {
    return true; //d.tsync >= startT && d.tsync <= endT;
  });
  //console.log(data_.length);

  var dataFiltered = data.filter(function(d) {
          if (d.tsync >= startT && d.tsync <= endT) {
              return true;
          }
        });

  var geoX = d3.scale.linear()
    .domain([0, 125])
    .range([0, viewWidth]);
  var geoY = d3.scale.linear()
    .domain([0, 125])
    .range([viewHeight, 0]);
  
  var points = heatmapSvg.selectAll("circle")
    .data(dataFiltered);

  var colorScale = d3.scale.linear()
    .domain([getMin(dataFiltered, data_) * 100, getMax(dataFiltered, data_) * 100])
    .range(["yellow", "red"]);

  points.enter()
    .append("circle")
      .attr("class", "unit")
      .attr("cx", function(d) { return geoX(parseInt(d.x)); })
      .attr("cy", function(d) { return geoY(parseInt(d.y)); })
      .attr("r", 2)
      .style("stroke", "black")
      .style("fill", function(d) {
        //console.log(colorScale(getCount(d, data_) * 100));
        return colorScale(getCount(d, data_) / 10);
      })
      .style("opacity", function(d) { return 1.0; });
}

function getMin(data, data_) {
  var min = 99999;
  for (var i = 0; i < data.length; i++) {
    var element = data[i];
    var count = getCount(element, data_);
    if (count < min) {
      min = count;
    }
  }
  //console.log("Min: " + min);
  return min;
}

function getMax(data, data_) {
  var max = -1;
  for (var i = 0; i < data.length; i++) {
    var element = data[i];
    var count = getCount(element, data_);
    if (count > max) {
      max = count;
    }
  }
  //console.log("Max: " + max);
  return max;
}

function getCount(d, data) {
  for (var i = 0; i < data.length; i++) {
    var element = data[i];
    if (parseInt(element.x) ===  d.x && parseInt(element.y) === d.y) {
      return element.count;
    }
  }
  return 1;
}

function resizeHeatmap() {
  heatmapSvg.selectAll('*').remove();

  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

  heatmapSvg.attr("transform", "translate(" + viewWidth/2 + "," + viewHeight/2 + ")");
    
  draw_background("#heatmap");
  drawHeatmap();
}
