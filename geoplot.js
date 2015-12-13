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

	/*	geoplotSvg.append("g")
			.append("path")
            .attr("d", line(dataSorted))
            .attr("class", "line")
            .style("stroke-width", 2)
            .style("stroke", colorShit[i])
            .style("stroke-dasharray", dataSorted.filter(function(d) {
            	if (prevY == -1 && prevX == -1) {
            		prevY = parseInt(d.y);
            		prevX = parseInt(d.x);
            	}

            	if ((parseInt(d.x) - prevX) > 40 || (parseInt(d.y) - prevY) > 40)
            		return "50,50";
            	return "50,50";
            	// console.log("Ghehe: " + d);
            }))
            //.style("stroke-dasharray", "10, 10")
            .style("fill", "none")
            .style("stroke-opacity", "0.5"); */
	}
}

function distance(d, prevX, prevY) {
	var x_ = Math.pow(Math.abs(parseInt(d.x) - prevX), 2);
	var y_ = Math.pow(Math.abs(parseInt(d.y) - prevY), 2);
	return Math.sqrt(x_ + y_);
}

function draw_boats()
{
	draw_vectors();
	
	var circles = geoplotSvg.selectAll("circle")
		.data(boat_data.boats);
				
	circles.enter()
		.append("circle")
		.attr("class", "boat")
		.attr("cx", function(d){return geoX(d.x);})
		.attr("cy", function(d){return geoY(d.y);})
		.attr("r", 4)
		.style("stroke","black")
		.style("fill","white")
		.style("opacity",0.5);
}

function draw_vectors()
{
	geoplotSvg.append("defs").append("marker")
		.attr("id", "end-arrow")
		.attr("viewBox","-10 0 10 10")
		.attr("refX", 0)
		.attr("refY", 5)
		.attr("markerWidth", 5)
		.attr("markerHeight", 5)
		.attr("orient", "auto")
		.style("fill","white")
		.attr("stroke-width", 1)
		.attr("stroke","black")
		.append("path")
			.attr("d", "M -10 0 L 0 5 L -10 10 Z"); //this is actual shape for arrowhead (a triangle)
	
	var boats = boat_data.boats;

	var arc = d3.svg.arc()
			.innerRadius( function(d) { return geoX(speed(d)-d.m) })
			.outerRadius( function(d) { return geoX(speed(d)+d.m) })
			.startAngle(  function(d) { 
				var u = d.u/speed(d); var v = d.v/speed(d);
				var center_angle = u < 0 ? -Math.acos(-v) : Math.acos(-v);
				return center_angle - (d.a * (Math.PI/180)) }) //converting from degs to radians
			.endAngle(  function(d) { 
				var u = d.u/speed(d); var v = d.v/speed(d);
				var center_angle = u < 0 ? -Math.acos(-v) : Math.acos(-v);
				return center_angle + (d.a * (Math.PI/180)) }) //converting from degs to radians
	
	var arcs = geoplotSvg.selectAll("path")
		.data(boat_data.boats)
		.enter()
		.append("path")
		.attr("class","boat_arc")
		.attr("d", arc)
		.attr("transform", function(d){ return "translate("+geoX(d.x)+","+geoY(d.y)+")" })
		.style("fill", function(d){ return speedColorMap(speed(d)) })
		.style("opacity",1.0)
		.attr("stroke-width", 1)
		.attr("stroke", "black");


			
	var arrows = geoplotSvg.selectAll("line")
		.data(boat_data.boats);	
		
	arrows.enter()
		.append("line")
		.attr("class", "boat_vector_outline")
		.attr("x1",function(d){return geoX(d.x);})
		.attr("y1",function(d){return geoY(d.y);})
		.attr("x2",function(d){return geoX(d.x+d.u);})
		.attr("y2",function(d){return geoY(d.y+d.v);})
		.attr("stroke-width", 3)
		.attr("stroke", "black")
		.style("opacity",1.0)
		.attr("fill", function(d){return speedColorMap(0.5);});
	
	arrows.enter()
		.append("line")
		.attr("class", "boat_vector")
		.style("opacity",1.0)
		.attr("x1",function(d){return geoX(d.x);})
		.attr("y1",function(d){return geoY(d.y);})
		.attr("x2",function(d){return geoX(d.x+d.u);})
		.attr("y2",function(d){return geoY(d.y+d.v);})
		.attr("stroke-width", 2)
		.attr("stroke", function(d){return speedColorMap(speed(d));})
		.attr("fill", function(d){return speedColorMap(speed(d));})
		.style("marker-end",function(){return "url(#end-arrow)"});
}

function draw_legend() {

	var defs = geoplotSvg.select( "defs" );

	var legendMargin = {top: 20, right: 20};

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
	    .attr( "id", "gradientCenter" )
	    .attr( "offset", "50%" )
	    .style( "stop-opacity", 1);

	legendGradient.append( "stop" )
	    .attr( "id", "gradientStop" )
	    .attr( "offset", "100%" )
	    .style( "stop-opacity", 1);

  	geoplotSvg.select("#gradientStart")
    	.style("stop-color", "green");
  	geoplotSvg.select("#gradientCenter")
    	.style("stop-color", "yellow");
  	geoplotSvg.select("#gradientStop")
    	.style("stop-color", "red");

  	var legend = geoplotSvg.append("g")
      .attr("class", "legend");

	legend.append("rect")
      .attr("x", viewWidth - 18 - legendMargin.right)
      .attr("y", legendMargin.top)
      .attr("width", 18)
      .attr("height", 72)
      .style("fill", "url(#geoLegendGradient)");

  	legend.append("text")
      .attr("x", viewWidth - 22 - legendMargin.right)
      .attr("y", 6 + legendMargin.top)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("high");

  	legend.append("text")
      .attr("x", viewWidth - 22 - legendMargin.right)
      .attr("y", 66 + legendMargin.top)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("low");

 	legend.append("text")
      .attr("x", viewWidth - legendMargin.right)
      .attr("y", 82 + legendMargin.top)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Speed");
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