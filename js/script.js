//API Key : AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow

var tableID, locationColumn, map, layer, popcountylayer, panelHeight, mapcenter, zoomlevel;
var StateBox, selState, CountyBox, selCounty, ChemicalBox, selChemical, heatmapRadio; 
var markers, rectangles, selToxic, ToxicBox, toxicRadio, popRadio, selOpacity, selRadius, selResolution, heatmap; 
var popcountylayer, popcountypntlayer, poptractlayer, poptractpntlayer, legendWrapper, legend1, title, legend;

function initialize() {

    tableID = '1y1gwFSVHwVQffsE23C5Z23Yhztwuv5dF3V-GSjOq';
    locationColumn = 'Latitude';

    //Google Maps API to visualize the map
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: {
        lat: 40.741037, 
        lng: -100.109076
      },
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.HYBRID
    });

    //Fusion Table layer
    layer = new google.maps.FusionTablesLayer({
        query:{
          select: locationColumn,
          from: tableID
        },
    });

    //Set the minimum/maximum Zoom level, so it won't zoom in/out too much.
    google.maps.event.addListener(map, 'zoom_changed', function() {
        var zoomLevel = map.getZoom();
        if (zoomLevel > 10) {
            map.setZoom(10);
        } else if(zoomLevel < 3){
            map.setZoom(3);
        };
    }); 

    heatmap = new google.maps.visualization.HeatmapLayer();

    //set the radio buttons enabled/disabled based on the checkbox selection
    heatmapRadio = document.getElementsByName('heatmapRadio');
    for (var i = 0; i< heatmapRadio.length;  i++){
        heatmapRadio[i].disabled = true;
    }

    toxicRadio = document.getElementsByName('ToxicRadio');
    for (var i = 0; i< toxicRadio.length;  i++){
        toxicRadio[i].disabled = true;
    }

    popRadio = document.getElementsByName('PopulationRadio');
    for (var i = 0; i< popRadio.length;  i++){
        popRadio[i].disabled = true;
    }

    legend = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
    pointLayer = document.getElementById('Point');
    heatmapLayer = document.getElementById('HeatmapLayer');
    popLayer = document.getElementById('PopulationLayer');
    rasterLayer = document.getElementById('RasterLayer');
    //Get the Dropdown box selected values
    StateBox = document.getElementById('State');
    CountyBox = document.getElementById('County');
    ChemicalBox = document.getElementById('Chemical');

    //Add items to the State and Chemical dropdown boxes from Fusion Table
    getData("State");
    //getData("County");    
    getData("Chemical");

    mapcenter = new google.maps.LatLng();
    markers = [];
    rectangles = [];

    $("#PopulationLayer").click(function(){
        $("#ColPop").toggle("fast",function(){

        });
    });
    $("#RasterLayer").click(function(){
        $("#ColRaster").toggle("fast",function(){
            
        });
    });
    $("#HeatmapLayer").click(function(){
        $("#ColToxic").hide();
        $("#ColHeat").toggle("fast",function(){
            
        });
    });
    $("#ToxicEmi").click(function(){
        $("#ColToxic").show();
    });
    $("#HeatmapPnt").click(function(){
        $("#ColToxic").hide();
    });

    //Collapse/Expand the panel
    $("#col_exp").click(function(){
        $("#panel_main").toggle("fast",function(){
            if (document.getElementById('col_exp').value == '-') {
                document.getElementById('col_exp').value = "+";       
            } else{
                document.getElementById('col_exp').value = "-";               
            };            
        });
    });

    popcountylayer = new google.maps.FusionTablesLayer({
        query:{
          select: 'poly',
          from: '1Px4PoATk7Ce_BTVEXxqVv_jbttNNvg8b8NGxMriE'
        }
    });

    popcountypntlayer = new google.maps.FusionTablesLayer({
        query:{
          select: 'poly',
          from: '1O6_8-xCNPO4lv6o-j-j_S638IB-mGqe3FbfPWw9j'
         }
    });

    poptractlayer = new google.maps.FusionTablesLayer({
        query:{
          select: 'poly',
          from: '1qNXUsN2ZuV5UbZTlTG2EuyWI9n6qNqjVpXsqVRzq'
        }
    });

    poptractpntlayer = new google.maps.FusionTablesLayer({
        query:{
          select: 'poly',
          from: '1kwOTlX5jlUCgOj8oiB71M8C0YR_37WMkizwV50Z5'
        }
    });

    legendWrapper = document.createElement('div');
    legendWrapper.id = 'legendWrapper';
    legendWrapper.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
        legendWrapper);
    legend1 = document.getElementById('legend1');
    title = document.createElement('p');
}
var COLUMN_STYLES = {
    'countylayer':[
        {
            'min': 0,
            'max': 12,
            'color': '#E3C1CD'
        },
        {
            'min': 12,
            'max': 31,
            'color': '#E3A3BA'
        },
        {
            'min': 31,
            'max': 62,
            'color': '#E67AA0'
        },
        {
            'min': 62,
            'max': 169,
            'color': '#E84A82'
        },
        {
            'min': 169,
            'max': 45208,
            'color': '#EB135F'
        }
    ],
    'tractlayer':[
        {
            'min': 0,
            'max': 151,
            'color': '#E3C1CD'
        },
        {
            'min': 151,
            'max': 1163,
            'color': '#E3A3BA'
        },
        {
            'min': 1163,
            'max': 3050,
            'color': '#E67AA0'
        },
        {
            'min': 3050,
            'max': 6186,
            'color': '#E84A82'
        },
        {
            'min': 6186,
            'max': 881954,
            'color': '#EB135F'
        }
    ],
    'countypntlayer':[
        {
            'min': 0,
            'max': 12,
            'iconName': 'small_yellow',
            'color': '#FAF766'
        },
        {
            'min': 12,
            'max': 31,
            'iconName': 'small_green',
            'color': '#52D93B'
        },
        {
            'min': 31,
            'max': 62,
            'iconName': 'measle_turquoise',
            'color': '#7CECF2'
        },
        {
            'min': 62,
            'max': 169,
            'iconName': 'small_purple',
            'color': '#F18CF5'
        },
        {
            'min': 169,
            'max': 45208,
            'iconName': 'small_red',
            'color': '#F2555F'
        }
    ],
    'tractpntlayer':[
        {
            'min': 0,
            'max': 151,
            'iconName': 'small_yellow',
            'color': '#FAF766'
        },
        {
            'min': 151,
            'max': 1163,
            'iconName': 'small_green',
            'color': '#52D93B'
        },
        {
            'min': 1163,
            'max': 3050,
            'iconName': 'measle_turquoise',
            'color': '#7CECF2'
        },
        {
            'min': 3050,
            'max': 6186,
            'iconName': 'small_purple',
            'color': '#F18CF5'
        },
        {
            'min': 6186,
            'max': 881954,
            'iconName': 'small_red',
            'color': '#F2555F'
        }
    ]    
};

//Get data from the server and add in the dropdown list
function getData(Column) {
    // Builds a Fusion Tables SQL query and hands the result to dataHandler()
    //var query = 'https://www.googleapis.com/fusiontables/v1/tables/1eXzPtDLF7ZfEyK76tRYpLgph8aZzVCoaqfPzyLfa/columns/6?key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow';
    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT "+ Column +" FROM "+ tableID +" ORDER BY "+ Column +"&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    if (Column == "State") {
        var jqxhr = $.get(queryurl, function(data){
            addColumnOption(StateBox, data);
        });
    } else if(Column == "County"){
        var jqxhr = $.get(queryurl, function(data){
            addColumnOption(CountyBox, data);
        });
    } else if(Column == "Chemical"){
        var jqxhr = $.get(queryurl, function(data){
            addColumnOption(ChemicalBox, data);
        });
    };  
}

//Add to different selectboxes
function addColumnOption(selectbox, data){
    var List = new Array();    
    // display the first row of retrieved data
    for (var i = 0; i < data.rows.length; i++) {
        if (List.indexOf(data.rows[i][0])==-1){
            List.push(data.rows[i][0]);
            addOption(selectbox, data.rows[i][0], data.rows[i][0]);
        }   
    };
}

//Add options to the selectbox one by one
function addOption(selectbox,text,value ){
    var optn = document.createElement("Option");
    optn.text = text;
    optn.value = value;
    selectbox.options.add(optn);
}

//filter county and chemical dropdown boxes options based on the selection of the state
function ClickState(){
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;
    if (selState != 0) {
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT County FROM "+ tableID +"  WHERE State='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerCounty);

        var query1 = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Chemical FROM "+ tableID +"  WHERE State='" + selState + "' ORDER BY Chemical&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl1 = encodeURI(query1);
        var jqxhr1 = $.get(queryurl1, dataHandlerChemical);                
    } else{
        var i;
        for(i = CountyBox.options.length-1;i>=0;i--)
        {
            CountyBox.remove(i);
        }
        addOption(CountyBox,"select a state first", "1");

        var query1 = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Chemical FROM "+ tableID +"  ORDER BY Chemical&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl1 = encodeURI(query1);
        var jqxhr1 = $.get(queryurl1, dataHandlerChemical);   
    };
}

//Update the county options everytime state gets changed
function dataHandlerCounty(data) {
    var i;
    for(i = CountyBox.options.length-1;i>=0;i--)
    {
        CountyBox.remove(i);
    }
    // display the first row of retrieved data
    addOption(CountyBox,"All", "0");

    addColumnOption(CountyBox, data);
}

//Update the Chemical options everytime state/county gets changed
function dataHandlerChemical(data) {
    var i;
    for(i = ChemicalBox.options.length-1;i>=0;i--)
    {
        ChemicalBox.remove(i);
    }
    // display the first row of retrieved data
    addOption(ChemicalBox,"All", "0");

    addColumnOption(ChemicalBox, data);
}

//Chemical dropdown box changes with the changing of the selection in the county box
function ClickCounty(){
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;
    if (selCounty != 0) {
            var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Chemical FROM "+ tableID +"  WHERE County='" + selCounty + "' ORDER BY Chemical&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
            var queryurl = encodeURI(query);
            var jqxhr = $.get(queryurl, dataHandlerChemical);                 
    } else{
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Chemical FROM "+ tableID +"  WHERE State='" + selState + "' ORDER BY Chemical&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerChemical);   
    };
}

//Heatmap checkbox checked/unchecked event, changing with the radio button disabled/enabled
function HeatCheck(){
    if (document.getElementById('HeatmapLayer').checked) {
        for (var i = 0; i< heatmapRadio.length;  i++){
            heatmapRadio[i].disabled = false;
        }
        heatmapRadio[0].checked = true;
    } else{
        for (var i = 0; i< toxicRadio.length;  i++){
            toxicRadio[i].disabled = true;
            toxicRadio[i].checked = false;
        }
        for (var i = 0; i< heatmapRadio.length;  i++){
            heatmapRadio[i].disabled = true;
            heatmapRadio[i].checked = false;
        }
    };
}

//TRI Facility Density radio button selected, disable all the radio buttons under Toxit Emission Density radio buttons
function PointRadio(){
    for (var i = 0; i< toxicRadio.length;  i++){
        toxicRadio[i].disabled = true;
        toxicRadio[i].checked = false;
    }      
}

//Enable all the radio buttons under Toxic Emission Density when it is checked
function ToxicEmiRadio(){
    if (document.getElementById('ToxicEmi').checked) {
        for (var i = 0; i< toxicRadio.length;  i++){
            toxicRadio[i].disabled = false;
        } 
        toxicRadio[0].checked = true;       
    }
}

//Enable/disable radio buttons under Population Density checkbox
function PopCheck(){
    if (popLayer.checked) {
        for (var i = 0; i< popRadio.length;  i++){
            popRadio[i].disabled = false;
        }
        popRadio[0].checked = true;
    } else{
        for (var i = 0; i< popRadio.length;  i++){
            popRadio[i].disabled = true;
            popRadio[i].checked = false;
        }
    };    
}

//Click Run trigger event
function Run(){
    //disable Run button and grey it out while it is running
    if (pointLayer.checked||heatmapLayer.checked||popLayer.checked||rasterLayer.checked) {
        var run = document.getElementById('run');
        run.style.background = '#A1A6A5';
        run.disabled = true;        
    };

    //get the values of three dropdown boxes
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;

    //TRI Facility Layer
    if (pointLayer.checked) {
        searchCriteria("", dataHandlerCenter);
    } else{
        removeMarkers();
    };

    //Heatmap Layer
    if (heatmapLayer.checked) {
        selRadius = parseInt(document.getElementById('radiusbar').value);
        selOpacity = parseFloat(document.getElementById('opacitybar').value);
        //TRI Facility Density
        if (document.getElementById('HeatmapPnt').checked) {
            searchCriteria("", dataHandlerHeatmap);
        } else{ //Toxic Emission Density
            ToxicBox = document.getElementsByName('ToxicRadio');
            for(var i = 0; i < ToxicBox.length; i++){
                if(ToxicBox[i].checked){
                    selToxic = ToxicBox[i].value;
                }
            }
            searchCriteria(",SUM('"+ selToxic +"')", dataHandlerHeatmapWeight);
        };

    } else{
        heatmap.setMap(null);
    };
    //Population Density Layer
    if (popLayer.checked) {
        if (document.getElementById('CountyRadio').checked) {
            popcountypntlayer.setMap(null);
            poptractlayer.setMap(null);
            poptractpntlayer.setMap(null);
            applyStyle(map, popcountylayer, 'countylayer');
            popcountylayer.setMap(map);
            updateLegend('countylayer', 'County Population Density (people per square mile)');
        } else if(document.getElementById('CountyPointRadio').checked){
            popcountylayer.setMap(null);
            poptractlayer.setMap(null);
            poptractpntlayer.setMap(null);
            applyStyle(map, popcountypntlayer, 'countypntlayer');
            popcountypntlayer.setMap(map);
            updateLegend('countypntlayer', 'County Point Population Density (people per square mile)');
        } else if(document.getElementById('CensusTractRadio').checked){
            popcountylayer.setMap(null);
            popcountypntlayer.setMap(null);
            poptractpntlayer.setMap(null);
            applyStyle(map, poptractlayer, 'tractlayer');
            poptractlayer.setMap(map);
            updateLegend('tractlayer', 'Tract Population Density (people per square mile)');
        } else{
            popcountylayer.setMap(null);
            poptractlayer.setMap(null);
            popcountypntlayer.setMap(null);
            applyStyle(map, poptractpntlayer, 'tractpntlayer');
            poptractpntlayer.setMap(map);
            updateLegend('tractpntlayer', 'Tract Point Population Density (people per square mile)');
        };
        if (!(pointLayer.checked||heatmapLayer.checked||rasterLayer.checked)) {
            var run = document.getElementById('run');
            run.style.background = '#79bbff';
            run.disabled = false;
        };
    } else{
        popcountylayer.setMap(null);
        popcountypntlayer.setMap(null);
        poptractlayer.setMap(null);
        poptractpntlayer.setMap(null);
        if (!($('#legendWrapper').is(':empty'))) {
            legendWrapper.removeChild(legend1);
        };
    };

    //Raster Layer
    if (rasterLayer.checked) {
        selResolution = parseFloat(document.getElementById('resolutionbar').value);
        searchCriteria("", dataHandlerRaster);
    } else{
        removeRaster();
        $('#legend').hide();
    };
}

// Apply the style to the layer & generate corresponding legend
function applyStyle(map, layer, column) {
    var columnStyle = COLUMN_STYLES[column];
    var styles = [];
    if (layer == popcountylayer || layer == poptractlayer) {
        for (var i in columnStyle) {
          var style = columnStyle[i];
          styles.push({
            where: generateWhere(style.min, style.max),
            polygonOptions: {
              fillColor: style.color,
              fillOpacity: style.opacity ? style.opacity : 0.8
            }
          });
        }        
    } else{
        for (var i in columnStyle) {
          var style = columnStyle[i];
          styles.push({
            where: generateWhere(style.min, style.max),
            markerOptions: {
              iconName: style.iconName
            }
          });
        }         
    };

    layer.set('styles', styles);
}

function generateWhere(low, high) {
    var whereClause = [];
    whereClause.push("'PopDens' >= ");
    whereClause.push(low);
    whereClause.push(" AND 'PopDens' < ");
    whereClause.push(high);
    return whereClause.join('');
}

// Update the legend content
function updateLegend(column, title) {

    if (!($('#legendWrapper').is(':empty'))) {
        legendWrapper.removeChild(legend1);
    };
    
    legendContent(legendWrapper, column, title);
}

// Generate the content for the legend
function legendContent(legendWrapper, column, title1) {
    legend1 = document.createElement('div');
    legend1.id = 'legend1';

    title.innerHTML = title1;
    legend1.appendChild(title);

    var columnStyle = COLUMN_STYLES[column];
    for (var i in columnStyle) {
      var style = columnStyle[i];

      var legendItem = document.createElement('div');

      var color = document.createElement('span');
      if (column == "countylayer" || column == "tractlayer") {
        color.setAttribute('class', 'color');        
      } else{
        color.setAttribute('class', 'colorcircle');
      };

      color.style.backgroundColor = style.color;
      legendItem.appendChild(color);

      var minMax = document.createElement('span');
      minMax.innerHTML = style.min + ' - ' + style.max;
      legendItem.appendChild(minMax);

      legend1.appendChild(legendItem);
    }

    legendWrapper.appendChild(legend1);

}

//Different combinations of three dropdown boxes: State, County and Chemical
function searchCriteria(column, dataHandlerType){
    //"State" is All
    if (selState == 0) {
        //"Chemical" is All (All state, all chemical)
        if (selChemical == 0) {
            sendRequest(" GROUP BY Latitude,Longitude", column, dataHandlerType);
        } else{ //"Chemcial" is selected not all (All state, one chemical)
            sendRequest(" WHERE Chemical='" + selChemical + "'", column, dataHandlerType);
        };
    } else{ //Select one specific state
        //"County" is all
        if (selCounty == 0) {
            //"Chemical" is all (All chemicals in one state)
            if (selChemical == 0) {
                sendRequest(" WHERE State='" + selState + "' GROUP BY Latitude,Longitude", column, dataHandlerType);
            } else{ //"Chemical" is not all (One State, one chemical)
                sendRequest(" WHERE State='" + selState + "' AND Chemical='" + selChemical + "'", column, dataHandlerType);
            };
        } else{ //"County" is selected
            if (selChemical == 0) { //all chemicals in one county
                sendRequest(" WHERE County='" + selCounty + "' GROUP BY Latitude,Longitude", column, dataHandlerType);
            } else{ //one chemical in one county
                sendRequest(" WHERE County='" + selCounty + "' AND Chemical='" + selChemical + "'", column, dataHandlerType);
            };
        };
    };
}

//send request and get data from fusion table
function sendRequest(statement, column, dataHandlerType){
    if (dataHandlerType == dataHandlerCenter) {
        removeMarkers();
    };
    if (dataHandlerType == dataHandlerRaster) {
        removeRaster();
    };
    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude"+ column +" FROM "+ tableID + statement +"&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerType)
    //get current center and zoom level for Full Extend button
    .done(function(){
        mapcenter = map.getCenter();
        zoomlevel = map.getZoom();
        //enable run button when it finishes running
        var run = document.getElementById('run');
        run.style.background = '#79bbff';
        run.disabled = false;
    });
}

//Center the selected results
function dataHandlerCenter(data) {
    if (data.hasOwnProperty('rows')) {
        var bounds = new google.maps.LatLngBounds();
        for(i = 0; i < data.rows.length; i++) {
            var point = new google.maps.LatLng(
                data.rows[i][0], 
                data.rows[i][1]
                );
            var marker = new google.maps.Marker({
                position: point,
                map: map
            });
            markers.push(marker);
            bounds.extend(point);
        }
        // zoom to the bounds
        map.fitBounds(bounds);
    }else{
        alert("No data");
    };
}

//remove markers when unselect TRI Facilities
function removeMarkers(){
    if (markers.length != 0) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);                    
        };
        markers = [];
    }    
}
//remove raster when unselect Raster checkbox
function removeRaster(){
    if (rectangles.length != 0) {
        for (var i = 0; i < rectangles.length; i++) {
            rectangles[i].setMap(null);                    
        };
        rectangles = [];
    }    
}

//Heatmap for TRI Facility Density
function dataHandlerHeatmap(data){

    var newLoc = new Array();    
    var bounds = new google.maps.LatLngBounds();
    
    for(i = 0; i < data.rows.length; i++) {
        var point = new google.maps.LatLng(
            data.rows[i][0], 
            data.rows[i][1]);
        newLoc.push({
            location: point, 
           });
        bounds.extend(point);
    }
    // zoom to the bounds
    map.fitBounds(bounds);

    heatmap.set('opacity', selOpacity);
    heatmap.set('radius', selRadius);
    heatmap.setData(newLoc);
    heatmap.setMap(map);
}

//Heatmap for Toxic Emission Density
function dataHandlerHeatmapWeight(data){
    var newLoc = new Array();    
    var preValue;

    var bounds = new google.maps.LatLngBounds();
    for(i = 0; i < data.rows.length; i++) {
        var point = new google.maps.LatLng(
            data.rows[i][0], 
            data.rows[i][1]);
        var value = parseFloat(data.rows[i][2]);

        newLoc.push({
            location: point, 
            weight: value
            });
        bounds.extend(point);
    }
    // zoom to the bounds
    map.fitBounds(bounds);

    heatmap.set('opacity', selOpacity);
    heatmap.set('radius', selRadius);
    //heatmap.set('dissipating', false);
    //heatmap.set('maxIntensity', 250000000000);
    heatmap.setData(newLoc);
    heatmap.setMap(map);
}

//Raster layer
function dataHandlerRaster(data){
    var newLoc = new Array();    
    var bounds = new google.maps.LatLngBounds();
    
    for(i = 0; i < data.rows.length; i++) {
        var point = new google.maps.LatLng(
            data.rows[i][0], 
            data.rows[i][1]);
        newLoc.push({
            location: point, 
           });
        bounds.extend(point);
    }
    // zoom to the bounds
    map.fitBounds(bounds);

    //draw raster
    createRaster(data, bounds, selResolution);
}

/*
data is a 1D array of latlong pairs
bounds is the bounding box of data, defined as two corner points
*/
function createRaster(data, bounds, resolution){
    //get NE, NW, SW, SE point of the bound
    var pointNElat = bounds.getNorthEast().lat();
    var pointNElng = bounds.getNorthEast().lng();
    var pointSWlat = bounds.getSouthWest().lat();
    var pointSWlng = bounds.getSouthWest().lng();

    var pointSW = new google.maps.LatLng(pointSWlat,pointSWlng);
    var pointSE = new google.maps.LatLng(pointSWlat,pointNElng);
    var pointNW = new google.maps.LatLng(pointNElat,pointSWlng);
    var pointNE = new google.maps.LatLng(pointNElat,pointNElng);

    //get Longitudes in the bound 
    var pointsLng = []; 
    var currentLng = pointSWlng;
    pointsLng.push(currentLng);
    //get the bound of each raster
    if (pointSWlng > 0 && pointNElng < 0) {
        while(currentLng > 0 && currentLng < 180 - resolution){ 
            currentLng = currentLng + resolution;
            pointsLng.push(currentLng); 
        }
        currentLng = resolution + currentLng - 360;
        pointsLng.push(currentLng);
        while(currentLng < pointNElng){
            currentLng = currentLng + resolution;
            pointsLng.push(currentLng);  
        }
    } else{
        while(currentLng < pointNElng){
            currentLng = currentLng + resolution;
            pointsLng.push(currentLng);  
        }    
    };

    //get Latitude in the bound
    var pointsLat = []; 
    var currentLat = pointSWlat;
    pointsLat.push(currentLat);

    while(currentLat < pointNElat){
        currentLat = currentLat + resolution;
        pointsLat.push(currentLat);  
    }

    //Create raster array with bound of each cell, and centerPoint as the center of each cell
    var rasterArray = [];
    var centerPoint = new google.maps.LatLng();
    var facilityNumber;
    var boundWeight = []; 
    //maximum facility number in 11km area from the center of each cell
    var maxFacilitynumber = 0;   
    for (var i = 0; i < pointsLat.length - 1; i++) {
        for (var j = 0; j < pointsLng.length - 1; j++) {
            var boundSW = new google.maps.LatLng(pointsLat[i],pointsLng[j]);
            var boundNE = new google.maps.LatLng(pointsLat[i+1],pointsLng[j+1]);
            var rasterBound = new google.maps.LatLngBounds(boundSW,boundNE);
            centerPoint = rasterBound.getCenter();
            facilityNumber = getNumber(centerPoint, data);
            if (facilityNumber > maxFacilitynumber) {
                maxFacilitynumber = facilityNumber;
            };
            boundWeight = [rasterBound, facilityNumber];
            rasterArray.push(boundWeight);
        };
    };

    //draw raster on the map
    for (var i = 0; i < rasterArray.length; i++) {
        var rectangle = new google.maps.Rectangle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 0,
            fillColor: '#FF0000',
            fillOpacity: rasterArray[i][1]/maxFacilitynumber,
            map: map,
            bounds: rasterArray[i][0]
        });
        rectangles.push(rectangle);
    };

    //add the maximum facility number to the legend
    var max = document.getElementById('max'); 
    max.innerHTML = maxFacilitynumber;
    $('#legend').show();
}

function getNumber(point, data){
    // // draw circle using the center of each cell as the center to show search area
    // var populationOptions = {
    //   strokeColor: '#FF0000',
    //   strokeOpacity: 0.8,
    //   strokeWeight: 2,
    //   fillColor: '#FF0000',
    //   fillOpacity: 0.35,
    //   map: map,
    //   center: point,
    //   radius: 11000
    // };
    // // Add the circle for this city to the map.
    // cityCircle = new google.maps.Circle(populationOptions);

    //calculate the number of facilities in 11km area of each cell
    var distance;
    var number = 0;
    for (var i = 0; i < data.rows.length; i++) {
        var pointFacility = new google.maps.LatLng(data.rows[i][0],data.rows[i][1]);
        distance = google.maps.geometry.spherical.computeDistanceBetween(point,pointFacility);
        if (distance < 11000) {
            number ++;
        };
    };
    return number;
}

//update the text on the right of the sliderbar to show currently selected value on the sliderbar
function UpdateSliderbar1(newvalue){
    //document.getElementById("bar").value = newvalue;
    document.getElementById("range1").innerHTML = newvalue + "px";
}

function UpdateSliderbar2(newvalue){
    //document.getElementById("bar").value = newvalue;
    document.getElementById("range2").innerHTML = newvalue;
}

function UpdateSliderbar3(newvalue){
    //document.getElementById("bar").value = newvalue;
    document.getElementById("range3").innerHTML = newvalue + "degree";
}

//click Full Extent button event
function FullExtent(){
    map.setCenter(mapcenter);
    map.setZoom(zoomlevel);
}

google.maps.event.addDomListener(window, 'load', initialize);