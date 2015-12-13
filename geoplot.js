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
	draw_points();
	draw_lines();
	// draw_boats();
	// draw_legend();
}

var startT = 0, endT = 120;
function draw_points()
{
	if (firstLoad) {
		setTimeout(function() {}, 3000); // check again in a second
		firstLoad = false;
	}

	geoplotSvg.selectAll("circle").remove();

	var points = geoplotSvg.selectAll("circle")
		.data(data);

	var minTSync = d3.min(data, function(d) { return d.tsync; });
	var maxTSync = d3.max(data, function(d) { return d.tsync; });

	geoX = d3.scale.linear()
		.domain([0, 125])
    	.range([-5, viewWidth - 5]);
 	geoY = d3.scale.linear()
		.domain([0, 125])
	    .range([viewHeight - 10, -10]);

	points.enter()
		.append("circle")
			.filter(function(d) {
				return d.tsync >= startT && d.tsync <= endT;
			})
			.attr("class", "unit")
			.attr("oldX", function(d) { return d.x; })
			.attr("oldY", function(d) { return d.y; })
			.attr("cx", function(d) { return geoX(parseInt(d.x)); })
			.attr("cy", function(d) { return geoY(parseInt(d.y)); })
			.attr("r", 2)
			.style("stroke", "black")
			.style("fill", function(d) {
				if (d.team == "radiant") {
					return intToRGB(hashCode(d.player));
				} else {
					return intToRGB(hashCode(d.player));
				}
			})
			.style("opacity", function(d) { return 1.0; });
}

function draw_lines() {
	// begin of drawing lines
	var line = d3.svg.line()
	    .x(function(d){return geoX(parseInt(d.x));})
	    .y(function(d){return geoY(parseInt(d.y));})
	    .interpolate("basis");

	var playerNestData = d3.nest()
		.key(function(d) { return d.player; })
		.entries(data);

	var paths = geoplotSvg.selectAll("path")
		.data(playerNestData);

	geoplotSvg.selectAll(".line").remove();
	var colorShit = ["red", "blue", "white", "violet", "black", "orange", "green", "purple", "pink", "brown", "white", "white"];
	var i = 0;
	for (var k in playerNestData) {
		i++;
		var prevY = -1, prevX = -1;
		console.log("Player: " + k + " => " + playerNestData[k].values.length);

		// Data sorted on the player names and then selected timeframe
		var dataSorted = playerNestData[k].values.sort(function(a,b) { 
            return a.player - b.player;
        }).filter(function(d) {
        	if (d.tsync >= startT && d.tsync <= endT) {
            	return true;
	        }
        });
        
        geoplotSvg.append("g").selectAll(".line")
        	.data(dataSorted)
        	.enter().append("path")
        	.attr("class", "line")
        	.attr("d", function(d, i) {
        		 var p1 = dataSorted[i]; var p2 = dataSorted[i+1];
        		if (p2 != undefined) {
        			if (Math.abs(parseInt(p1.x) - parseInt(p2.x)) > 40 || Math.abs(parseInt(p1.y) - parseInt(p2.y)) > 40)
        				console.log("xxx");
        			else
        				return line([p1, p2]);
        		}
        	})
        	.attr("stroke", colorShit[i])
			.attr("stroke-width", 2)
			.attr("fill", "none"); 
    
        geoplotSvg.append("g").selectAll(".line")
        	.data(dataSorted)
        	.enter().append("path")
        	.attr("class", "line")
        	.attr("d", function(d, i) {
        		var p1 = dataSorted[i]; var p2 = dataSorted[i+1];
        		if (p2 != undefined) {
        			if (Math.abs(parseInt(p1.x) - parseInt(p2.x)) > 40 || Math.abs(parseInt(p1.y) - parseInt(p2.y)) > 40)
						return line([p1, p2]);
        			else
        				console.log("xxx");
        		}
        	})
        	.attr("stroke", colorShit[i])
			.attr("stroke-width", 2)
			.attr("fill", "none")
            .style("stroke-dasharray", "5, 10");
	}
}

function resizeGeoplot()
{	
	geoplotSvg.selectAll("*").remove();
	geoplotSvg.style("width",viewWidth);//leave some room for the buttons and text
	geoplotSvg.style("height",viewHeight);//leave some room for the buttons and text

	geoX.range([0, viewWidth]);
 	geoY.range([0, viewHeight]);
		
	draw_background();
	draw_geoplot();
}