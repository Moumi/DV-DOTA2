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

function draw_heatmap() {
  geoplotSvg.selectAll('rect').remove();

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
    .domain([(maxCount / binData.length), maxCount])
    .range(["yellow", "red"]);

  var attrScale = d3.scale.linear()
    .domain([0, range])
    .range([0, viewHeight]);

  rects.enter()
    .append("rect")
      .attr("class", "unit")
      .attr("y_", function(d) { return (d.x); })
      .attr("x_", function(d) { return (d.y); }) 
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

function resizeHeatmap() {
  d3.select("#scatterplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    
  draw_heatmap();
}
