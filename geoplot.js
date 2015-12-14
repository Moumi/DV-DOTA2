var firstLoad = true;

var geoplotSvg = d3.select("#geoplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

 var geoX = d3.scale.linear()
	.domain([0, 125])
    .range([0, viewWidth]);
 var geoY = d3.scale.linear()
	.domain([0, 125])
    .range([viewHeight, 0]);

var speedColorMap = d3.scale.linear()
	.domain([0, 25, 50])
	.range(["green", "yellow", "red"]);

var domain = [0, 10, 100, 500, 1000, 2000, 3000, 10000];
var colorScale = d3.scale.quantize().domain(domain).range(["red","orange","green", "white", "orange"]);

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function speed(d) {
	return Math.sqrt(d.u * d.u + d.v * d.v);
}

function draw_geoplot() {	
	init();	
	draw_lines();
}

function init(){
	geoX = d3.scale.linear()
		.domain([0, 125])
    	.range([-5, viewWidth - 5]);
 	geoY = d3.scale.linear()
		.domain([0, 125])
	    .range([viewHeight - 10, -10]);
}

var startT = 0, endT = 120;

function marker_start(color, val) 
{
	geoplotSvg.append("defs").append("marker")
		.attr("id", val)
		.attr("viewBox","-6 -6 12 12")
		.attr("refX", 0)
		.attr("refY", 0)
		.attr("markerWidth", 4)
		.attr("markerHeight", 4)
		.attr("orient", "auto")
		.style("fill",color)
		.attr("stroke-width", 1)
		.attr("stroke","black")
		.append("path")
			.attr("d", "M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0"); //this is actual shape for arrowhead (a triangle)
	return "url(#" +val+ ")";
}

function marker_end(color, val) 
{
	geoplotSvg.append("defs").append("marker")
		.attr("id", val)
		.attr("viewBox","-10 0 10 10")
		.attr("refX", 0)
		.attr("refY", 3)
		.attr("markerWidth", 4)
		.attr("markerHeight", 4)
		.attr("orient", "auto")
		.style("fill",color)
		.attr("stroke-width", 1)
		.attr("stroke","black")
		.append("path")
			.attr("d", "M -10 0 L 0 5 L -10 10 Z"); //this is actual shape for arrowhead (a triangle)
	return "url(#" +val+ ")";
}

function draw_lines() {
	// begin of drawing lines
	geoplotSvg.selectAll("marker").remove();

	var line = d3.svg.line()
	    .x(function(d){return geoX(parseInt(d.x));})
	    .y(function(d){return geoY(parseInt(d.y));})
	    .interpolate("linear");

	var playerNestData = d3.nest()
		.key(function(d) { return d.player; })
		.entries(data);

	var paths = geoplotSvg.selectAll("path")
		.data(playerNestData);

	geoplotSvg.selectAll(".line").remove();
	geoplotSvg.selectAll(".line-dashed").remove();
	var colorShit = ["red", "blue", "white", "violet", "black", "orange", "green", "purple", "pink", "brown", "white", "white"];
	for (var k in playerNestData) {
		// Color for the line
		var strokeColor = intToRGB(hashCode(playerNestData[k].key));

		// Data sorted on the player names
		var dataSorted = playerNestData[k].values.sort(function(a,b) { 
            return a.player - b.player;
        });
        // Data filtered on the selected timeframe
        var dataFiltered = dataSorted.filter(function(d) {
        	if (d.tsync >= startT && d.tsync <= endT) {
            	return true;
	        }
        });

        var playerData1 = dataFiltered.filter(function(d, i) {
			var p1 = dataFiltered[i]; var p2 = dataFiltered[i+1];
        	if (p2 != undefined) {
        		if (Math.abs(parseInt(p1.x) - parseInt(p2.x)) > 40 || Math.abs(parseInt(p1.y) - parseInt(p2.y)) > 40) {
        			return false;
        		} else {
        			return true;
        		}
        	}		
        });

        var playerData2 = dataFiltered.filter(function(d) {
    		return playerData1.indexOf(d) == -1;
		});
        
        var groupElement = geoplotSvg
        	.append("g")
        		.attr("player", playerNestData[k].key);

       	groupElement
        	.append("path")
				.attr("class", "line-dashed")
				.attr("d", line(playerData2))
	        	.attr("stroke", "#" + strokeColor)
				.attr("stroke-width", 2)
				.attr("fill", "none")
	            .style("stroke-dasharray", "5, 10")

	    groupElement
        	.append("path")
	        	.attr("class", "line")
	        	.attr("d", line(playerData1))
	        	.attr("stroke", "#" + strokeColor)
				.attr("stroke-width", 2)
				.attr("fill", "none")
				.style("marker-start", marker_start("#" + strokeColor, "start_marker_" + k))
				.style("marker-end", marker_end("#" + strokeColor, "end_marker_" + k));
	}
}

function resizeGeoplot()
{	
	geoplotSvg.selectAll("*").remove();
	geoplotSvg.style("width",viewWidth);//leave some room for the buttons and text
	geoplotSvg.style("height",viewHeight);//leave some room for the buttons and text

	geoX.range([-5, viewWidth - 5]);
	geoY.range([viewHeight - 10, -10]);
		
	draw_background("#geoplot");
	draw_geoplot();
}