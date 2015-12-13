var button_caption1 = "Use satellite image";
var button_caption2 = "Use map image";

var button_data1 = "Use 1-0";
var button_data2 = "Use 1-1";

function draw_background()
{
	var vis   = d3.select("#geoplot").select("svg")
	
	var width = vis.style("width").replace("px", "");
    var height = vis.style("height").replace("px", "");

	
	var defs= vis.append('defs')
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
	
	vis.append("a")
		.append("path")
		.attr("id","texture_path")
		.attr("d", "M 0,0, "+width+",0, "+width+","+height+", 0,"+height+", 0,0 z")
		.attr("transform", "translate(0, 0)")
		.attr("fill", "url(#bg_image)");
}		

function update_background()
{
	var elem = document.getElementById("btn_background");

	var vis   = d3.select("#geoplot").select("svg")
	var width = vis.style("height").replace("px", "");
    var height = vis.style("width").replace("px", "");
	
	d3.select(bg_image).attr("width", width);
	d3.select(bg_image).attr("height", height);	
	
	d3.select(url_to_image).attr("width", width);
	d3.select(url_to_image).attr("height", height);	
	
	d3.select(texture_path).attr("d", "M 0,0, "+width+",0, "+width+","+height+", 0,"+height+", 0,0 z");
		
	var caption = elem.textContent || elem.innerText; //to make sure it works in every browser
	
    if (caption==button_caption1)
	{
		elem.innerText = button_caption2;   //Works in Chrome and IE, but not in Firefox
		elem.textContent = button_caption2; //Right way to do it, but might not work in IE
		d3.select(url_to_image).attr("xlink:href", "images/big_map.jpg");
		d3.select("#geoplot").selectAll("text").style("fill", "white");
	}
    else 
	{
		elem.innerText = button_caption1;   //Works in Chrome and IE, but not in Firefox
		elem.textContent = button_caption1; //Right way to do it, but might not work in IE
		d3.select(url_to_image).attr("xlink:href", "images/big_map.jpg");
		d3.select("#geoplot").selectAll("text").style("fill", "black");
	}	

	// resizeGeoplot();
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
    } else {
       	setTimeout(waitForDataLoad, 100);
    }
}

function update_data()
{
	var elem = document.getElementById("btn_data");
		
	var caption = elem.textContent || elem.innerText; //to make sure it works in every browser
	var zoneData = "";

    if (caption==button_data1) {
		elem.innerText = button_data2;   //Works in Chrome and IE, but not in Firefox
		elem.textContent = button_data2; //Right way to do it, but might not work in IE
		zoneData = "data/master-zones-1-0.js";
		replacejsfile("data/master-zones-1-1.js", zoneData, "js");
	} else {
		elem.innerText = button_data1;   //Works in Chrome and IE, but not in Firefox
		elem.textContent = button_data1; //Right way to do it, but might not work in IE
		zoneData = "data/master-zones-1-1.js";
		replacejsfile("data/master-zones-1-0.js", zoneData, "js");
	}

	$.getScript("http://localhost:8080/" + zoneData, function() {
    	// alert("Script loaded and executed.");
    	draw_geoplot();
 	});
}


function fill_combobox() {
	var select = document.getElementById("matchBox");
	for(var i = 0; i < matches.length; i++) {
            var option = matches[i];
            var element = document.createElement("option");
            element.textContent = option;
            element.value = option;
            select.appendChild(element);
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
    replacejsfile(currentMatch, 'data/'+matchID+'.js', 'js', 'current_data');
    waitForDataLoad();
    // replace distance file
    var currentMatch = 'data/'+document.getElementById("current_distance").src;
    currentMatch = currentMatch.split('data/')[2];
    replacejsfile(currentMatch, 'data/'+matchID+'_master-distance.js', 'js', 'current_distance');
    waitForDataLoad();
}

fill_combobox();
select_match();

document.getElementById("btn_background").innerText = button_caption1;  //Works in Chrome and IE, but not in Firefox
document.getElementById("btn_background").textContent = button_caption1;//Right way to do it, but might not work in IE
document.getElementById("btn_data").innerText = button_data2;  //Works in Chrome and IE, but not in Firefox
document.getElementById("btn_data").textContent = button_data2;//Right way to do it, but might not work in IE

draw_background();