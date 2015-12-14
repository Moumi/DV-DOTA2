var heatmapSvg = d3.select("#heatmap").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);

function drawHeatmap() {
  var data_ = heatmapData[0][Object.keys(heatmapData[0])].filter(function(d) {
    var tsync = Object.keys(d)[0];
    return tsync >= startT && tsync <= endT;
  });

  var data1 = heatmapData[0];
  console.log(Object.keys(data1)[0]);
  // var data2 = data[1][Object.keys(data1)];

  // console.log(data2);

  // var dataHeatmap = [];
  // data_.forEach(function(d) {
  //   var values = d[Object.keys(d)[0]];

  //   for (var k in values) {
  //     var obj = values[k];
  //     var obj_ = getObject(dataHeatmap, obj.x, obj.y);
  //     if (obj_ != null) {
  //       var old = obj_.count;
  //       obj_.count += obj.count;
  //     } else {
  //       dataHeatmap.push(obj);
  //     }
  //   }
  // });



  // var geoX = d3.scale.linear()
  //   .domain([0, 125])
  //   .range([0, viewWidth]);
  // var geoY = d3.scale.linear()
  //   .domain([0, 125])
  //   .range([viewHeight, 0]);
  
  // var points = heatmapSvg.selectAll("rect")
  //   .data(dataHeatmap);

  // var colorScale = d3.scale.linear()
  //   .domain([0, 6])
  //   .range(["yellow", "red"]);

  // points.enter()
  //   .append("rect")
  //     .attr("class", "unit")
  //     .attr("x", function(d) { return geoX(parseInt(d.x)); })
  //     .attr("y", function(d) { return geoY(parseInt(d.y)); })
  //     .attr("width", 5)
  //     .attr("height", 5)
  //     // .attr("r", 4)
  //     // .style("stroke", function(d) {
  //     //   return colorScale(d.count);
  //     // })
  //     .style("fill", function(d) {
  //       return colorScale(d.count);
  //     })
  //     .style("opacity", function(d) { return 1.0; });
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
