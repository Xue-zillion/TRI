//API Key : AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow

var tableID, locationColumn, map, layer, StateBox, selState, CountyBox, selCounty, ChemicalBox, selChemical, ToxicBox, heatmap, CountyKML, SCTractKML;

function initialize() {

	tableID = '1Q6AhIjgkzyWQ4csnjfLmy2dfebBURCe4uVcpaB-y';
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

    //InfoWindow
    google.maps.event.addListener(layer, 'click', function(e) {
        // Change the content of the InfoWindow
        e.infoWindowHtml = "TRIF ID: " + e.row['TRIF ID'].value + "<br>" + "CAS Number: " + e.row['CAS Number'].value + "<br>" +   
        "Chemical: " + e.row['Chemical'].value + "<br>" + "Name: " + e.row['Name'].value + "<br>" + "City: " + e.row['City'].value + 
        "<br>" + "County: " + e.row['County'].value + "<br>" + "State: " + e.row['State'].value + "<br>" + 
        "Fugitive Air Emissions (Toxicity x Pounds): " + e.row['Fugitive Air Emissions (Toxicity x Pounds)'].value + "<br>" + 
        "Point Source Air Emissions (Toxicity x Pounds): " + e.row['Point Source Air Emissions (Toxicity x Pounds)'].value + 
        "<br>" + "Surface Water Discharges (Toxicity x Pounds): " + e.row['Surface Water Discharges (Toxicity x Pounds)'].value + 
        "<br>" + "Total On-site Land Releases (Toxicity x Pounds): " + e.row['Total On-site Land Releases (Toxicity x Pounds)'].value;
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

    //Get the Dropdown box selected values
	StateBox = document.getElementById('State');
	CountyBox = document.getElementById('County');
	ChemicalBox = document.getElementById('Chemical');
    ToxicBox = document.forms[0];
    addOption(CountyBox,"All", "0");
	getData("Chemical");
    getData("State");

    //Create a heatmap layer for further use
    heatmap = new google.maps.visualization.HeatmapLayer();

    CountyKML = new google.maps.KmlLayer({
        url: 'http://www.spatialdatamining.org/kml/County.kmz'
    });
    CountyKML.setZIndex(-1);   

    SCTractKML = new google.maps.KmlLayer({
        url: 'http://www.spatialdatamining.org/kml/South_Carolina_Tract.kmz'
    });
    SCTractKML.setZIndex(-1);

    //Default to show all the points to match with the default values for the dropdown boxes
    showAll();
}

//Collapse/Expand the panel
function Collapse(){

    if (document.getElementById('col_exp').value == 'Collapse') {
        document.getElementById('panel_main').style.visibility = 'hidden';
        document.getElementById('panel').style.height = '35px';
        document.getElementById('col_exp').value = "Expand";       
    } else{
        document.getElementById('panel').style.height = '464px';        
        document.getElementById('panel_main').style.visibility = 'visible';
        document.getElementById('col_exp').value = "Collapse";               
    };
}

//Click Show All Button event
function showAll(){
    //Show all the points with the "small_red" icons
    heatmap.setMap(null);
    layer.setOptions({
        query:{
          select: locationColumn,
          from: tableID
        },
        heatmap: {
            enabled: false
        },
        styles:[
            {markerOptions: {iconName: "small_blue"}}
        ]
    }); 
    //zoom to the level where all the points can be shown
    map.setOptions({
        center: {
            lat: 44.554583,
            lng: -125.593108
        },
        zoom: 4
    });
    layer.setMap(map);
    setValue();
}

function ClickState(){
    selState = StateBox.value;
    if (selState != "0") {
        AddCounty();
        document.getElementById('CountyText').style.visibility = 'visible';
        CountyBox.style.visibility = 'visible';
    } else{
        document.getElementById('CountyText').style.visibility = 'hidden';
        CountyBox.style.visibility = 'hidden';
    };
}

function CountyLayerOn(){

    TractLayerOff();
    heatmap.setMap(null);
    // var zoom = map.getZoom();
    // CountyWKML.setZoom = zoom;
    // CountyEKML.setZoom = zoom;

    CountyKML.setMap(map); 
}

function CountyLayerOff(){
    CountyKML.setMap(null);
}

function TractLayerOn(){
    CountyLayerOff();
    heatmap.setMap(null);
    SCTractKML.setMap(map); 
}

function TractLayerOff(){
    SCTractKML.setMap(null);
}

// //Hide all the points
// function hideAll(){
//     map.setOptions({
//         center: {
//             lat: 44.554583,
//             lng: -125.593108
//         },
//         zoom: 4
//     });

//     layer.setMap();
// }

//Create the heatmap of all the points in the database
function HeatMap(){
    showAll();
    layer.setOptions({
        heatmap: {
          enabled: true
        }
    });
    setValue();
}

function setHeatmap(data){
    heatmap.setData(data);
    heatmap.setMap(map);
}

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

//state dropdown list onclick event. Get and center the points for each state
function selectState(){
	selState = StateBox.value;
	//var selState = "New York";
	layer.setOptions({
	    query: {
	      select: locationColumn,
	      from: tableID,
	      where: "State = '" + selState + "'"
	    },
        heatmap: {
          enabled: false
        },
        styles:[
            {markerOptions: {iconName: "red_circle"}}
        ]
	});	
	layer.setMap(map);
    /*document.getElementById('CountyText').style.visibility = 'visible';
    CountyBox.style.visibility = 'visible';
    document.getElementById('CountyBtn').style.visibility = 'visible';*/
    
    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE State='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCenter);
    if (selState == "0") {
        document.getElementById('CountyText').style.visibility = 'hidden';
        CountyBox.style.visibility = 'hidden';
    } else{
       AddCounty(); 
    };
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
            bounds.extend(point);
        }
        // zoom to the bounds
        map.fitBounds(bounds);
    }else{
        alert("No data");
    };
}

//Add county selection based on the state you select
function AddCounty(){
    // document.getElementById('CountyText').style.visibility = 'visible';
    // CountyBox.style.visibility = 'visible';

    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT County FROM "+ tableID +"  WHERE State='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCounty);
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

//show the points located in the selected county
function selectCounty(){
	selCounty = CountyBox.value;
	//var selState = "New York";
	layer.setOptions({
	    query: {
	      select: locationColumn,
	      from: tableID,
	      where: "County = '" + selCounty + "'"
	    },
        heatmap: {
          enabled: false
        },
        styles:[
            {markerOptions: {iconName: "red_circle"}}
        ]
	});	
	layer.setMap(map);

	//var query = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM 1eXzPtDLF7ZfEyK76tRYpLgph8aZzVCoaqfPzyLfa WHERE State="' + selState + '"&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow';
    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE County='" + selCounty + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCenter);
}

//Show all the points with the selected chemical
function selectChemical(){
	selChemical = ChemicalBox.value;
	//var selState = "New York";
	layer.setOptions({
	    query: {
	      select: locationColumn,
	      from: tableID,
	      where: "Chemical = '" + selChemical + "'"
	    },
        heatmap: {
          enabled: false
        },
        styles:[
            {markerOptions: {iconName: "red_circle"}}
        ]
	});	
	layer.setMap(map);

    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE Chemical='" + selChemical + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCenter);
}

/*//Select the column name as the selected value and created the heatmap using the weight
function selectToxic(){
    var selToxic = ToxicBox.value;   
    ChemicalBox.value = "0";
    StateBox.value = "0";
    document.getElementById('CountyText').style.visibility = 'hidden';
    CountyBox.style.visibility = 'hidden';

    if (selToxic != "0") {
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO '' AND '"+ selToxic +"' NOT EQUAL TO '0'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmapWeight);
    } else{
        alert("Please Select!");
    };
}*/

function dataHandlerHeatmapWeight(data){
    var newLoc = new Array();    
    var prevPoint = new google.maps.LatLng();
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

/*      if (i == 0) {
            prevPoint = point;
            preValue= value;         
        }else{
            if (point.lat() == prevPoint.lat() && point.lng() == prevPoint.lng()) {
                preValue += value;
            } else{
                newLoc.push({
                    location: prevPoint, 
                    weight: preValue
                });            
                prevPoint = point;
                preValue = value;
            };
        };*/
        bounds.extend(point);
    }
    // zoom to the bounds
    map.fitBounds(bounds);

    heatmap.set('opacity', 0.8);
    heatmap.set('radius', 30);
    //heatmap.set('dissipating', false);
    //heatmap.set('maxIntensity', 250000000000);
    heatmap.setData(newLoc);
    heatmap.setMap(map);
}

//State dropdown box onchange event, get chemical and county dropdown box to do the search
function StateSearch(){
    heatmap.setMap(null);
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;
    ToxicBox[0].checked = true;

    if (selState != "0") {
        AddCounty();
    } else{
        document.getElementById('CountyText').style.visibility = 'hidden';
        CountyBox.style.visibility = 'hidden';

    };
    selCounty = "0";
    //var selState = "New York";
    if (selState == "0" && selChemical == "0") {
        showAll();
    } else{
        if (selChemical == "0") {
            if (selCounty == "0") {
                selectState();
            } else{
                selectCounty();
            };
        } else if (selState == "0"){
            selectChemical();
        } else{
            if (selCounty == "0") {
                SearchChemicalState();
            } else{
                SearchChemicalCounty();
            };
        };
    }; 
}

//Chemical dropdown box onchange event, get State and County dropdown box to do the search
function ClickChemical(){
    heatmap.setMap(null);
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;
    ToxicBox[0].checked = true;

    if (selChemical == "0") {
        if (selState == "0") {
            showAll();
        } else if (selCounty == "0"){
            selectState();
        } else{
            selectCounty();
        };
    } else{
        if (selState == "0") {
            selectChemical();
        } else if (selCounty == "0"){
            SearchChemicalState();
        } else{
            SearchChemicalCounty();
        };

    };
}

//County dropdown box onchange event, get chemical and state dropdown box to do the search
function ClickCounty(){
    heatmap.setMap(null);
    selState = StateBox.value;
    selCounty = CountyBox.value;
    selChemical = ChemicalBox.value;
    ToxicBox[0].checked = true;

    if (selCounty == "0") {
        if (selChemical == "0") {
            selectState();
        } else{
            SearchChemicalState();
        };
    } else{
        if (selChemical == "0") {
            selectCounty();
        } else{
            SearchChemicalCounty();
        };
    };
}

//Do the chemical + state search
function SearchChemicalState(){
    layer.setOptions({
        query: {
          select: locationColumn,
          from: tableID,
          where: "Chemical = '" + selChemical + "' and State = '" + selState + "'"
        },
        heatmap: {
          enabled: false
        },
        styles:[
            {markerOptions: {iconName: "red_circle"}}
        ]
    }); 
    layer.setMap(map);

    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE Chemical='" + selChemical + "' AND State = '" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCenter);
}

//do the chemical + county search
function SearchChemicalCounty(){
    layer.setOptions({
        query: {
          select: locationColumn,
          from: tableID,
          where: "Chemical = '" + selChemical + "' and County = '" + selCounty + "'"
        },
        heatmap: {
          enabled: false
        },
        styles:[
            {markerOptions: {iconName: "red_circle"}}
        ]
    }); 
    layer.setMap(map);

    var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE Chemical='" + selChemical + "' AND County = '" + selCounty + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
    var queryurl = encodeURI(query);
    var jqxhr = $.get(queryurl, dataHandlerCenter);
}

/*function HeatmapChemical(){
    ToxicBox.value = "0";
    StateBox.value = "0";
    CountyBox.value = "0";
    document.getElementById('CountyText').style.visibility = 'hidden';
    CountyBox.style.visibility = 'hidden';

    searchHeatmap(ChemicalBox, "Chemical");

}
*/

//Click HeatmapStaChe event, create the heatmap for Chemical + State
function HeatmapChemicalState(){
    CountyWKML.setMap(null);
    CountyEKML.setMap(null);
    SCTractKML.setMap(null);

    ToxicBox[0].checked = true;
    CountyBox.value = "0";
    document.getElementById('CountyText').style.visibility = 'hidden';
    CountyBox.style.visibility = 'hidden';

    var selChemical = ChemicalBox.value;
    var selState = StateBox.value;    
    if (selState == "0" && selChemical == "0") {
        HeatMap();
    } else if (selState == "0"){
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE Chemical ='" + selChemical + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmap);
    } else if(selChemical == "0"){
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE State ='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmap);
    }else{
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE Chemical='" + selChemical + "' AND State = '" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmap);
    };
}

function dataHandlerHeatmap(data){
    var newLoc = new Array();    
    var prevPoint = new google.maps.LatLng();
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

    heatmap.set('opacity', 0.7);
    heatmap.set('radius', 40);
    heatmap.setData(newLoc);
    heatmap.setMap(map);
}

//Click HeatmapStaTox event, create the heatmap for Toxic + State
function HeatmapToxicState(){
    CountyWKML.setMap(null);
    CountyEKML.setMap(null);
    SCTractKML.setMap(null);
    
    ChemicalBox.value = "0";
    CountyBox.value = "0";
    document.getElementById('CountyText').style.visibility = 'hidden';
    CountyBox.style.visibility = 'hidden';

    var selToxic;
    for(var i = 0; i < ToxicBox.length; i++){
        if(ToxicBox[i].checked){
            selToxic = ToxicBox[i].value;
        }
    }

    var selState = StateBox.value;    
    if (selState == "0" && selToxic == "0") {
        HeatMap();
    } else if (selState == "0"){
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO '' AND '"+ selToxic +"' NOT EQUAL TO '0'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmapWeight);
    } else if(selToxic == "0"){
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude FROM "+ tableID +"  WHERE State ='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmap);
    }else{
        layer.setMap(null);
        //var selToxic = "Fugitive Air Emissions (Toxicity x Pounds)";
        var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO '' AND '"+ selToxic +"' NOT EQUAL TO '0' AND State ='" + selState + "'&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        //var query = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT Latitude,Longitude,'"+ selToxic +"' FROM "+ tableID +" WHERE '"+ selToxic +"' NOT EQUAL TO ''&key=AIzaSyClmT0--eBE_r40OoRILf0m1wNhSQ8ueow";
        var queryurl = encodeURI(query);
        var jqxhr = $.get(queryurl, dataHandlerHeatmapWeight);
    };
}

//When click on some buttons or dropdown selections, other values need to be "empty" to make sure the values in the selectionboxes are matched with the result displaying
function setValue(){
    ToxicBox[0].checked = true;
    ChemicalBox.value = "0";
    StateBox.value = "0";
    CountyBox.value = "0";
    document.getElementById('CountyText').style.visibility = 'hidden';
    CountyBox.style.visibility = 'hidden';

}
google.maps.event.addDomListener(window, 'load', initialize);