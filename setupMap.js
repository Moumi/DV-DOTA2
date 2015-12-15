var show_geoplot = document.getElementById('radio_geoplot').checked;
var show_heatmap = document.getElementById('radio_heatmap').checked;

function draw_background(id)
{
	var vis = d3.select(id).select("svg");
    vis.select("#image").remove();
	
	var width = vis.attr("width");
    var height = vis.attr("height"); 

    vis.style("width", width);
    vis.style("height", height);
    vis.attr("width", width);
    vis.attr("height", height);
	
    var group = vis.append("g").attr("id", "image");

	var defs= group.append('defs')
		defs.append("pattern")
			.attr("id", "bg_image")
			.attr("patternUnits", "userSpaceOnUse")
			.attr("width", width)
			.attr("height", height)
			.append("svg:image")
			.attr("id","url_to_image")
			.attr("xlink:href", "images/big_map.jpg")
			.attr("width", width)
			.attr("height", height)
			.attr("x", 0)
			.attr("y", 0);
	
	group.append("a")
		.append("path")
		.attr("id","texture_path")
		.attr("d", "M 0,0, "+width+",0, "+width+","+height+", 0,"+height+", 0,0 z")
		.attr("transform", "translate(0, 0)")
		.attr("fill", "url(#bg_image)");
}

function createjsfile(filename, filetype, id){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
        fileref.setAttribute("id", id)
    }
    return fileref
}

function replacejsfile(oldfilename, newfilename, filetype, id){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist using
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1){
            var newDataElement=createjsfile(newfilename, filetype, id)
            allsuspects[i].parentNode.replaceChild(newDataElement, allsuspects[i])
        }
    }
}

var tempPlayer = data[0].player; var tempT = data[0].t;
function waitForDataLoad() {
	if (data[0].player != tempPlayer && data[0].t != tempT) {
    	tempPlayer = data[0].player;
    	tempT = data[0].t;
    	draw_geoplot();
        drawScatterplot();
        draw_heatmap();
    } else {
       	setTimeout(waitForDataLoad, 100);
    }
}

function resize(scatterplot) {
    var f = (typeof geoplotSvg !== 'undefined');
    if (f) {
        resizeGeoplot();        
        resizeHeatmap();
        if (scatterplot)
            resizeScatterplot();
    } else {
        setTimeout(resize, 50, scatterplot);
    }
}

function redraw() {
    console.log("redraw");
    var f = (typeof geoplotSvg !== 'undefined');
    if (f) {
        draw_geoplot();        
        draw_heatmap();
    } else {
        setTimeout(redraw, 50);
    }
}

function fill_tier_box() {
    var select = document.getElementById("tierBox");
    for(var i = 0; i < matches.length; i++) {
        var option = matches[i]["tier"];
        var found = false;
        for (j = 0; j < select.length; j++){
            if (select.options[j].value == option){
                found = true;
            }
        }
        if(!found) {
            var element = document.createElement("option");
            element.textContent = option;
            element.value = option;
            select.appendChild(element);
        }
    }
    select.selectedIndex = 0;
}

function select_tier() {
    fill_match_box();
    select_match();
}

function fill_match_box() {
    var tierBox = document.getElementById("tierBox");
    var tier = tierBox.options[tierBox.selectedIndex].value;
	var select = document.getElementById("matchBox");
    select.options.length = 0;
	for(var i = 0; i < matches.length; i++) {
        if(matches[i]["tier"] === tier) {
            var option = matches[i]["match"];
            var element = document.createElement("option");
            element.textContent = option;
            element.value = option;
            select.appendChild(element);
        }
	}
	select.selectedIndex = 0;
}

function select_match()
{
    var e = document.getElementById("matchBox");
    var matchID = e.options[e.selectedIndex].value;
    // replace data file
    var currentMatch = 'data/'+document.getElementById("current_data").src;
    currentMatch = currentMatch.split('data/')[2];
    replacejsfile(currentMatch, 'data/geoplot/'+matchID+'.js', 'js', 'current_data');

    // replace distance file
    var currentMatch = 'data/'+document.getElementById("current_distance").src;
    currentMatch = currentMatch.split('data/')[2];
    replacejsfile(currentMatch, 'data/distance/'+matchID+'_master-distance.js', 'js', 'current_distance');

    // replace heatmap file
    var currentMatch = 'data/'+document.getElementById("current_heatmap").src;
    currentMatch = currentMatch.split('data/')[2];
    replacejsfile(currentMatch, 'data/heatmap/'+matchID+'.js', 'js', 'current_heatmap');
    waitForDataLoad();

    // redraw();
    drawScatterplot(true);
}

function changeSelection(selection) {
  if(selection === "geoplot") {
    show_geoplot = true;
    show_heatmap = false;
    removeHeatmap();
    resizeGeoplot();
  }
  if(selection === "heatmap") {
    show_geoplot = false;
    show_heatmap = true;
    draw_geoplot();
    removeGeoplot();
    resizeHeatmap();
  }
}

fill_tier_box();
fill_match_box();
select_tier();
draw_background("#geoplot"); 