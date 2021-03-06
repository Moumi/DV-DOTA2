var geoplotSvg = d3.select("#geoplot").select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

var geoX; var geoY;
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

function draw_geoplot() {
	if(show_geoplot) {
		init();	
		draw_lines();
		draw_legend();
		var temp = document.getElementById("scatterplot");
    	temp.style.marginBottom = "38px";
	}
}

function init() {
	/** CRAZY ASS SHIT **/
	{
		var geoplotSVG = d3.select("#geoplot").select("svg");
		var width = geoplotSVG.style("width").replace("px", "");
	}

	/* Offsets for the x-range */
	var offsetXScale_1 = d3.scale.linear()
		.domain([104, 610])
		.range([10, 30]);
	var offsetXScale_2 = d3.scale.linear()
		.domain([104, 610])
		.range([5, 15]);

	var offsetX1 = offsetXScale_1(parseInt(width));
	var offsetX2 = offsetXScale_2(parseInt(width));

	/* Offsets for the y-range */
	var offsetYScale_1 = d3.scale.linear()
		.domain([104, 610])
		.range([10, 40]);

	var offsetY1 = offsetYScale_1(parseInt(width));
	var offsetY2 = 5;
	
	/* Geo scale for points */
	geoX = d3.scale.linear()
		.domain([5, 125])
	  	.range([offsetX1, viewWidth - offsetX2]);
	geoY = d3.scale.linear()
		.domain([5, 125])
		.range([viewHeight - offsetY1, offsetY2]);
}

function marker_start(group, color, val) 
{
	group.append("defs").append("marker")
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

function marker_end(group, color, val) 
{
	group.append("defs").append("marker")
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

function delete_mini_divs() {
	var team_text = ["dire", "radiant"];
	var div_texts = [];

	for (var i = 0; i < team_text.length; i++) {
		var divs = document.getElementById("legend_" + team_text[i] + "_container");
		if (divs == null) continue;
		while (divs.firstChild) {
			var element = divs.firstChild;
			if (element.id == team_text[i] + "_text") div_texts[i] = element;
			divs.removeChild(element); 
		}
		divs.appendChild(div_texts[i]);
	}
}

var playerColor = d3.scale.category10();
function draw_lines() {
	// begin of drawing lines
	geoplotSvg.selectAll("marker").remove();

	var line = d3.svg.line()
	    .x(function(d){return geoX(parseInt(d.x));})
	    .y(function(d){return geoY(parseInt(d.y));})
	    .interpolate("basis");


	var line2 = d3.svg.line()
	    .x(function(d){return geoX(parseInt(d.x));})
	    .y(function(d){return geoY(parseInt(d.y));})
	    .interpolate("linear");

	var playerNestData = d3.nest()
		.key(function(d) { return d.player; })
		.entries(data);

	var paths = geoplotSvg.selectAll("path")
		.data(playerNestData);

	// TEMP
	var dataExtremes = []; var firstShit = true;

	geoplotSvg.selectAll(".line").remove();
	geoplotSvg.selectAll(".line-dashed").remove();
	delete_mini_divs();
	for (var k in playerNestData) {
		// Name of player
		var playerName = playerNestData[k].key;

		// Color for the line
		var strokeColor = playerColor(k); //intToRGB(hashCode(playerName));

		// Change color of legend
		// var mini_box = document.getElementById("");

		// Data sorted on the player names
		var dataSorted = playerNestData[k].values.sort(function(a,b) { 
            return a.player - b.player;
        });

        // Data filtered on the selected timeframe
        var dataFiltered = dataSorted.filter(function(d, i) {
        	if (d.tsync >= timeFrame[0] && d.tsync <= timeFrame[1]) {
        		return true;
	        }
        });

    	var team = dataFiltered[0].team;
		if (document.getElementById(team + "_" + k) == null) {
			var legendDiv = document.getElementById("legend_" + team + "_container");
			if (legendDiv != null) {
	    		var playerDiv = document.createElement('div');
				playerDiv.id = team + "_" + k;
				playerDiv.style.background = strokeColor;
				playerDiv.style.marginRight = "10px";
				playerDiv.style.marginTop = "5px";
				playerDiv.style.opacity = "1.0";
				playerDiv.style.border = "pink 1px solid";

				legendDiv.appendChild(playerDiv);
			}
		}

        var teleportData = [];
        var regularWalkData = [];
        var regularWalk = [];
        for (var i = 0; i < dataFiltered.length - 1; i++) {
        	var d1 = dataFiltered[i]; var d2 = dataFiltered[i+1];
        	if (typeof d2 === 'undefined' || typeof d1 === 'undefined')
        		continue;

        	var dist = distance(d1.x, d1.y, d2.x, d2.y);
        	if (dist > 25) {
        		// regularWalk is not empty
        		if (regularWalk.length >= 1) {
        			// In case the begin and end points of regularWalk are the same as d1 and d2, do nothing
	        		if (d1.x == regularWalk[0].x && 
	        			d1.y == regularWalk[0].y && d2.x == regularWalk[regularWalk.length - 1].x && d2.y == regularWalk[regularWalk.length - 1].y ||
	        			d2.x == regularWalk[0].x && d2.y == regularWalk[0].y && d1.x == regularWalk[regularWalk.length - 1].x && d1.y == regularWalk[regularWalk.length - 1].y) {
	        			// do Nothing
	        		} else {
	        			// Otherwise it's a teleport/die situation
						teleportData.push([d1, d2]);
	        		}
        		}
					
				// Add the regular walk path
       			regularWalkData.push(regularWalk);
        		regularWalk = [];
        	} else {
        		// Add the paths
        		regularWalk.push(d1);
        		// regularWalk.push(d2);
        	}
        }
        if (regularWalkData.length < 1) // No teleports happened or did not die
        	regularWalkData.push(regularWalk);
        
        var playerGroup = geoplotSvg
        	.append("g")
        		.attr("player", playerName);

        var walkGroup = playerGroup
        	.append("g")
        		.attr("class", "regularWalk");

        for (var i = 0; i < regularWalkData.length; i++) {
        	walkGroup
	        	.append("path")
		        	.attr("class", "line")
		        	.attr("d", line(regularWalkData[i]))
		        	.attr("stroke", strokeColor)
					.attr("stroke-width", 2)
					.attr("fill", "none")
					.style("marker-start", marker_start(walkGroup, strokeColor, "start_marker_" + k))
					.style("marker-end", marker_end(walkGroup, strokeColor, "end_marker_" + k));
        }

        var teleportGroup = playerGroup
        	.append("g")
        		.attr("class", "teleport");

        for (var i = 0; i < teleportData.length; i++) {
        	teleportGroup
	        	.append("path")
					.attr("class", "line-dashed")
					.attr("d", line2(teleportData[i]))
		        	.attr("stroke", strokeColor)
					.attr("stroke-width", 2)
					.attr("fill", "none")
		            .style("stroke-dasharray", "5, 10");
        }
	}
}

function draw_legend() {
	var vis = d3.select("#geoplot").select("svg");	
	var width = vis.attr("width");
    var height = vis.attr("height");

    var geoplot_container = document.getElementById("geoplot_container");

	var legend_dire_container = document.getElementById("legend_dire_container");
	if (legend_dire_container == null) {
		legend_dire_container = document.createElement('div');
		legend_dire_container.id = "legend_dire_container";
		geoplot_container.appendChild(legend_dire_container);

		var dire_text = document.createElement('div');
    	dire_text.id = "dire_text";
    	dire_text.innerHTML = "Dire team:";
    	legend_dire_container.appendChild(dire_text);
	}
	legend_dire_container.style.width = parseInt(width) - 20 + "px";
	legend_dire_container.style.top = ((-1 * parseInt(height)) - 10) + "px";

	var legend_radiant_container = document.getElementById("legend_radiant_container");
	if (legend_radiant_container == null) {
		legend_radiant_container = document.createElement('div');
		legend_radiant_container.id = "legend_radiant_container";
		geoplot_container.appendChild(legend_radiant_container);

		var radiant_text = document.createElement('div');
    	radiant_text.id = "radiant_text";
    	radiant_text.innerHTML = "Radiant team:";
    	legend_radiant_container.appendChild(radiant_text);
	}
	legend_radiant_container.style.width = parseInt(width) - 20 + "px";

	draw_lines();
}

function resizeGeoplot() {
	if(show_geoplot) {
		geoplotSvg.selectAll("*").remove();
		geoplotSvg.style("width",viewWidth);//leave some room for the buttons and text
		geoplotSvg.style("height",viewHeight);//leave some room for the buttons and text
			
		draw_background("#geoplot");
		draw_geoplot();
	}
}

function removeGeoplot()
{
	d3.selectAll("#legend_dire_container").remove();
	d3.selectAll("#legend_radiant_container").remove();
	geoplotSvg.selectAll("g").remove();
	geoplotSvg.selectAll("defs").remove();
	geoplotSvg.selectAll("marker").remove();
	geoplotSvg.selectAll(".line").remove();
	geoplotSvg.selectAll(".line-dashed").remove();

	draw_background("#geoplot");
}

function distance(x1, y1, x2, y2) {
	var a = x1 - x2
	var b = y1 - y2

	return Math.sqrt( a*a + b*b );
}
