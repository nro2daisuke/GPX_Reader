/*
gpxMap.js

Ver. 1.02 20220621

(c)2022 all rights reserved by Naoki Ueda

"gpxMap.js" is distributed under CC4.0 (Creative Commons 4.0 license: http://creativecommons.org/licenses/by/4.0) license.

Dependencies:
This library use both "Leaflet" and "Leaflet.hotline" libraries, and thus inherits their copy rights and licensing restriction.
- Leaflet: https://leafletjs.com/index.html
- Leflet.hotline: https://iosphere.github.io/Leaflet.hotline/demo/

Disclaimer:
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

//Configuration
var DOCUMENTROOT_URL = ".";

var MIN_COLOR = "#008800";
var MID_COLOR = "#ffff00";
var MAX_COLOR = "#ff0000";
var OUTLINE_COLOR = "#000000";
var WEIGHT = 5;
var OUTLINE_WIDTH = 1;
var MAP_HEIGHT = "300px";
var FOOTER_BG_COLOR ="#CCCCCC";
//------------------------------------------


//Globals
var hotlineLayer;
var map;


//Initialize function
function gpxMapInit(){
    //Dinamically Load dependent script
	
	
    //Loaded-Flags
    window.leafletLoaded = false;
    window.leafletHotlineLoaded = false;
    //import leaflet
    let script1 = document.createElement('script');
    script1.setAttribute("src", DOCUMENTROOT_URL + "/scripts/leaflet.js");
    script1.setAttribute("type", "text/javascript");
    script1.setAttribute("async", false);
    document.body.appendChild(script1);
    script1.addEventListener("load", () => {
        window.leafletLoaded = true;
        //import leaflet.hotline
        let script2 = document.createElement('script');
        script2.setAttribute("src", DOCUMENTROOT_URL + "/scripts/leaflet.hotline.js");
        script2.setAttribute("type", "text/javascript");
        script2.setAttribute("async", false);
        document.body.appendChild(script2);
        script2.addEventListener("load", () => {
            window.leafletHotlineLoaded = true;
        });
    });

    //css
    let css1 = document.createElement('link');
    css1.setAttribute("href", DOCUMENTROOT_URL + "/scripts/leafletcss/leaflet.css");
    css1.setAttribute("rel", "stylesheet");
    css1.setAttribute("async", false);
    document.body.appendChild(css1);

    //Extract map DIV
    let outer = document.getElementById('gpxMap');
    if(outer==null){
        //if no DIV detected, do nothing
        return;
    }
    outer.setAttribute("style", "width:100%;");

    //Leaflet Map Div
    let lmapdiv = document.createElement("div");
    lmapdiv.id = "map";
    lmapdiv.setAttribute("style", "width:100%;height:"+MAP_HEIGHT);
    outer.appendChild(lmapdiv);
    //Footer div
    let footdiv = document.createElement("div");
    footdiv.id = "footdiv";
    footdiv.setAttribute("style", "padding: 2px; background-color:"+FOOTER_BG_COLOR);
    outer.appendChild(footdiv);
    //Selection element
    let zselect = document.createElement("select");
    zselect.id = "zAxis";
    zselect.setAttribute("style", "width: 150px;");
    footdiv.appendChild(zselect);
    zselect.addEventListener('change', reDrawHotline);
    //Legend span
    let legenddiv = document.createElement("span");
    legenddiv.id = "legenddiv";
    legenddiv.innerHTML="";
    legenddiv.setAttribute("style", "margin-left: 10px; ");
    footdiv.appendChild(legenddiv);
    //hotline copyright
    let hotlinecredit = document.createElement("span");
    hotlinecredit.id = "hotlinecredit";
    hotlinecredit.innerHTML="&copy; <a href='https://iosphere.github.io/Leaflet.hotline/demo/' style='text-decoration:none; color:#0078A8' target='_blank'>Leaflet.hotline</a>";
    hotlinecredit.setAttribute("style", "float:right; font-size:12;");
    footdiv.appendChild(hotlinecredit);

    //waiting for all scripts are ready and proceed initialization
    window.scriptWaiting=setInterval(function(){ 
        if (window.leafletLoaded && window.leafletHotlineLoaded) {
            clearInterval(window.scriptWaiting);
            mapInit();
        }
     }, 500);
}

//Initialization of Leaflet Map
function mapInit() {

    //Map Initialization
    
    map = L.map('map');
    var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoomLevel: 19
    });
    var stdLayer = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
        maxZoomLevel: 18
    })
    var ortLayer = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
        attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
        maxZoomLevel: 18
    })

    osmLayer.addTo(map);
    stdLayer.addTo(map);
    ortLayer.addTo(map);

    var baseLayers = {
        "地図(OpenStreetMap)": osmLayer,
        "地図（地理院地図）": stdLayer,
        "オルソ画像（地理院地図）": ortLayer,
    };
    var overlays = {};

    L.control.layers(baseLayers).addTo(map);
    L.control.scale().addTo(map);

    map.setView([35.0, 135.0], 5);
    var coords = [];

}

//Helper function
function addOption(label, value) {
    var option = document.createElement("option");
    option.text = label;
    option.value = value;
    document.getElementById('zAxis').appendChild(option);
    if (document.getElementById('zAxis').childNodes.length == 1) {
        document.getElementById('zAxis').selectedindex = 1;
    }
}

//Convert read GPX file into object tree
function convertGPX2data(gpx) {
    window.gpxdata = new Object();
    var dom_parser = new DOMParser();
    var dom = dom_parser.parseFromString(gpx, "application/xml");
    var trkpts = dom.getElementsByTagName('trkpt');
    window.gpxdata.trkpts = new Array();
    for (var i = 0; i < trkpts.length; i++) {
        /*      <trkpt lon="135.502514" lat="34.593867">
                    <ele>17.967487</ele>
                    <time>2021-12-09T03:16:52Z</time>
                    <extensions>
                        <speed>0.510000</speed>
                        <course>356.484375</course>
                        <hAcc>16.128092</hAcc>
                        <vAcc>6.656236</vAcc>
                    </extensions>
                </trkpt>
        */
        var trkpt = new Object();
        trkpt.lat = trkpts[i].getAttribute('lat');
        trkpt.lon = trkpts[i].getAttribute('lon');
        trkpt.ele = trkpts[i].getElementsByTagName('ele')[0].innerHTML;
        trkpt.time = trkpts[i].getElementsByTagName('time')[0].innerHTML;
        var extensions = trkpts[i].getElementsByTagName('extensions')[0];
        if (i == 0) {
            addOption("Elevetion", "ele");
        }
        for (var j = 0; j < extensions.childNodes.length; j++) {
            trkpt["" + extensions.childNodes[j].tagName] = extensions.childNodes[j].innerHTML;
            if (i == 0) {
                addOption("" + extensions.childNodes[j].tagName, "" + extensions.childNodes[j].tagName);
            }
        }
        window.gpxdata.trkpts.push(trkpt);
    }
    reDrawHotline();
}

//Based on current object Tree, redraw hot line
function reDrawHotline() {
    //reGenerate coords
    coords = new Array();
    var _min = 0;
    var _max = 0;
    for (var i = 0; i < window.gpxdata.trkpts.length; i++) {
        var point = new Array();
        var trkpt = window.gpxdata.trkpts[i];
        point.push(trkpt.lat - 0);
        point.push(trkpt.lon - 0);
        var selectdZ = document.getElementById('zAxis').value;
        point.push(trkpt[selectdZ] - 0);

        coords.push(point);

        if (i == 0) {
            _min = trkpt[selectdZ] - 0;
            _max = trkpt[selectdZ] - 0;
        } else {
            if (_min > trkpt[selectdZ] - 0) {
                _min = trkpt[selectdZ] - 0;
            }
            if (_max < trkpt[selectdZ] - 0) {
                _max = trkpt[selectdZ] - 0;
            }
        }
    }

    if(hotlineLayer!=null){
        map.removeLayer(hotlineLayer);
    }
    hotlineLayer = L.hotline(coords, {
        min: _min,
        max: _max,
        palette: {
            0.0: MIN_COLOR,
            0.5: MID_COLOR,
            1.0: MAX_COLOR
        },
        weight: WEIGHT,
        outlineColor: OUTLINE_COLOR,
        outlineWidth: OUTLINE_WIDTH
    });
    if (coords.length > 2) {
        var bounds = hotlineLayer.getBounds();
        map.fitBounds(bounds);
    }
    hotlineLayer.addTo(map);

    //Legend
    let legenddiv = document.getElementById("legenddiv");
    legenddiv.innerHTML = "Legend："
                        +"<span style='display:inline-block;width:24px; background-color:"+MIN_COLOR+"'>&nbsp;</span>" 
                        + _min
                        + "　～　"
                        +"<span style='display:inline-block;width:24px; background-color:"+MID_COLOR+"'>&nbsp;</span>"
                        + calcMid(_min, _max)
                        + "　～　"
                        +"<span style='display:inline-block;width:24px; background-color:"+MAX_COLOR+"'>&nbsp;</span>" 
                        + _max
}

//Helper function: to calculate "mid" value for legent.
function calcMid(min, max){
    min-=0;
    max-=0;
    var underDigitMin = (min+"").indexOf('.')<0?0:((min+"").length - (Math.floor(min)+"").length-1);
    var underDigitMax = (max+"").indexOf('.')<0?0:((max+"").length - (Math.floor(max)+"").length-1);
    var underDigit = underDigitMin>underDigitMax?underDigitMin:underDigitMax;
    var mid = (min + max)/2;
    return mid.toFixed(underDigit);
}

//Load GPX from URL location
function loadGPX(url){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) { 
            alert("Error in Resding GPX"); 
        } else {
            document.getElementById('zAxis').innerHTML="";//Clear options
            convertGPX2data(xhr.response);
        }
    };
    xhr.onerror = function() {
        alert("Error in Resding GPX"); 
    };
}

//Load GPX from local machine
function loadLocalGPX(event){
        var fr = new FileReader();
        fr.onload = function() {
            convertGPX2data(fr.result);
        }
        fr.readAsText(event.target.files[0],"utf-8");
}

//Set onload event to initialize
window.addEventListener('load', gpxMapInit);