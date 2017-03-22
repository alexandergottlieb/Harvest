$(document).on("click", ".collectItemButton", function() {
  alert("COLLECTING ITEM: " + $(this).attr("name"));
})

var map;
var geocoder;
var position = [54.767563, -1.570737];
var circle;
var markers = [];
var windows = [];
var items = [];
var searchAsMove = true;

var icons = {
  food: {
    icon: "Images/burgerResized.png"
  },
  foodSelected: {
    icon: "Images/burger2Resized.png"
  },
  fruit: {
    icon: "Images/testFruit.png"
  },
  fruitSelected: {
    icon: "Images/testFruitSelected.png"
  },
  veg: {
    icon: "Images/testVeg.png"
  },
  vegSelected: {
    icon: "Images/testVegSelected.png"
  },
  meat: {
    icon: "Images/testMeat.png"
  },
  meatSelected: {
    icon: "Images/testMeatSelected.png"
  },
};

function formQuery() {
  var query = "distance=" + $("#distanceFilter").val()
  if ($("#expirationFilter").val() != 0) {
      query = query + "&expiration=" + $("#expirationFilter").val();
  }
  if ($("#typeFilter").val() != 0) {
      query = query + "&type=" + $("#typeFilter").val();
  }

  return query;
}

function addItemToMap(item) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(item["latitude"], item["longitude"]),
    icon: icons[item["type"]].icon,
    type: item["type"],
    map: map,
    id: item["id"]
  });
  markers.push(marker);

  var infowindow = new google.maps.InfoWindow({
    content: ("<div class='container-fluid customInfoWindow'>" +
      "<h3 col-xs-12>" + item["name"] + "</h3>" +
      "<p>" + item["distance"] + "</p>" +
      "<p>" + item["best_before"] + "</p>" +
      "<button class='btn btn-default btn-block collectItemButton'>Collect</button></div>"),
    id: item["id"]
  });
  windows.push(infowindow);

  marker.addListener("click", function() {
    resetMap();
    marker.setIcon(icons[marker.type + "Selected"]["icon"]);
    infowindow.open(map, marker);
    map.setCenter(marker.getPosition());
  })

  google.maps.event.addListener(infowindow, 'closeclick', function() {  
      resetMap();
  }); 
}

/*
function addItemToItemsList(item) {
  var itemList = $(document).find(".item_display");
  var itemSuperContainer = $("<div class='row list-group'></div>");
  var itemContainer = $("<div class='list-group-item item_title col-xs-10 col-xs-offset-1'></div>")
  var itemImage = $("<div class='col-lg-4'><img src='banana.png' class='item_tile_image'></div>");
  var itemInfoContainer = $("<div class='col-lg-4'><h5 class='item_tile_name'>" + item["name"] + "</h5><p class='item_tile_distance'>" + item["distance"] + "</p><p class='item_tile_description'>" + item["description"] + "</p></div>");
  var buttonContainer = $("<div class='col-lg-4 item_button_group btn-block'></div>");
  
  var showMapButton = $("<button type='button' class='item_button item_tile_show_map btn glyphicon glyphicon-map-marker'>                                        show on map.</button>");
  $(showMapButton).click(function() {
    for(marker in markers) {
      if (markers[marker]["id"] == item["id"]) {
        for(infowindow in windows) {
          if (windows[infowindow]["id"] == item["id"]) {
            $("html, body").animate({
              scrollTop: -100 + $("#map").offset().top}, 400);
            resetMap();
            windows[infowindow].open(map, markers[marker]);
            map.setCenter(markers[marker].getPosition());
          }
        }
      }
    }

  })

  var moreDetailsButton = $("<button type='button' class='item_button item_tile_show_details btn glyphicon glyphicon-option-horizontal'>                                        show more details.</button>")
  var reserveButton = $("<button type='button' class='item_button item_tile_reserve btn glyphicon glyphicon-grain'>                                      reserve.</button>");

  $(buttonContainer).append(showMapButton);
  $(buttonContainer).append(moreDetailsButton);
  $(buttonContainer).append(reserveButton)

  $(itemContainer).append(itemImage);
  $(itemContainer).append(itemInfoContainer);
  $(itemContainer).append(buttonContainer);
  $(itemContainer).append("<hr>");

  $(itemSuperContainer).append(itemContainer);

  $(itemList.append(itemSuperContainer));
}
*/

function addItemToItemsList(item) {
  var container = $("<div class='col-xs-12 col-sm-6' style='margin: 0 0 15px 0;'></div>");
  var itemContainer = $("<div class='col-xs-12 itemContainer nopadding'></div>");

  var imageContainer = $("<div class='col-xs-12 col-sm-4 itemImageContainer'></div>");
  
  var infoContainer = $("<div class='col-xs-12 col-sm-4'></div>")
  $(infoContainer).append("<b><p>" + item["name"] + "</p></b>");
  $(infoContainer).append("<p>" + item["distance"] + "</p>");
  $(infoContainer).append("<p>" + item["best_before"] + "</p>");

  var optionsContainer = $("<div class='col-xs-12 col-sm-4'></div>");
  var collectButton = $("<button class='btn btn-default btn-block' style='margin-top: 15px;'>Collect</button>");
  var showOnMapButton = $("<button class='btn btn-default btn-block hidden-xs'>Show on Map</button>");
  $(showOnMapButton).click(function() {
    for(marker in markers) {
      if (markers[marker]["id"] == item["id"]) {
        for(infowindow in windows) {
          if (windows[infowindow]["id"] == item["id"]) {
            $("html, body").animate({
              scrollTop: -100 + $("#map").offset().top}, 400);
            resetMap();
            windows[infowindow].open(map, markers[marker]);
            map.setCenter(markers[marker].getPosition());
          }
        }
      }
    }
  })

  $(optionsContainer).append(collectButton);
  $(optionsContainer).append(showOnMapButton);

  $(itemContainer).append(imageContainer);
  $(itemContainer).append(infoContainer);
  $(itemContainer).append(optionsContainer);
  $(container).append(itemContainer);
  $("#itemsList").append(container);
}

function getItems(query) {
  items = [];
  $("#itemsList").empty();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  windows = [];

  $.ajax({
    type: "GET",
    // url: "/api/foods",
    url: "mapBackend.php?items&latitude=" + position[0] + "&longitude=" + position[1] + "&" + query,
    dataType: "json", 
    cache: false,
    success: function(result) {
      if (result.length == 0) {
        var itemList = $(document).find(".item_display");
        $(itemList).append("<h5>There are currently no items here, check back later!</h5>")
      }
      result.forEach(function(item) {
        items.push(item)
        addItemToMap(item);
        addItemToItemsList(item);
      });
      drawRadius($("#distanceFilter").val())
    },
  });
};

function resetMap() {
  markers.forEach(function(marker) {
    marker.setIcon(icons[marker.type]["icon"]);
  });
  windows.forEach(function(window) {
    window.close();
  });
}

function redrawMap() {
  markers = [];
  windows = [];
  items = getItems();
}

function drawRadius(distance) {
  if (circle != null) {
    circle.setMap(null);
  }
  circle = new google.maps.Circle({
    map: map,
    radius: distance * 1609.34,    // 10 miles in metres
    center: new google.maps.LatLng(position[0], position[1]),
    strokeColor: '#AA0000',
    strokeWeight: 1,
    fillOpacity: 0
  });
}

function codeAddress(address, query) {
  geocoder.geocode({'address':address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      position = [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
      map.setZoom(14);
      getItems(query);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: new google.maps.LatLng(position[0], position[1]),
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },  
  });

  google.maps.event.addListener(map, 'dragend', function(event) {
    if ($("#searchAsMove").prop("checked")) {
      position[0] = map.getCenter().lat();
      position[1] = map.getCenter().lng();
      var query = formQuery();
      getItems(query);
    }
  });

  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var moveAsSearchDiv = document.createElement('div');
  var moveAsSearch = new moveAsSearchControl(moveAsSearchDiv, map);

  moveAsSearchDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(moveAsSearchDiv);

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(newPosition) {
      // var pos = {
      //   lat: newPosition.coords.latitude,
      //   lng: newPosition.coords.longitude
      // };

      // map.setCenter(pos);
      // position = [newPosition.coords.latitude, newPosition.coords.longitude];

      getItems("distance=5");

    }, function() {
      alert("Error fetching your location");

      getItems("distance=5");
    });
  } else {
    // Browser doesn't support Geolocation
    alert("Sorry, your browser does not offer geolocation");

    getItems("distance=5");
  }
}

function moveAsSearchControl(controlDiv, map) {

  var controlUI = document.createElement('div');
  controlUI.style.paddingTop = "10px";
  controlDiv.appendChild(controlUI);

  var controlInnerDiv = document.createElement('div');
  controlInnerDiv.style.backgroundColor = '#fff';
  controlInnerDiv.style.color = 'rgb(25,25,25)';
  controlInnerDiv.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlInnerDiv.style.paddingLeft = '5px';
  controlInnerDiv.style.paddingRight = '5px';
  controlUI.appendChild(controlInnerDiv);

  var controlCheckbox = document.createElement("input");
  controlCheckbox.type = "checkbox";
  controlCheckbox.checked = "true";
  controlCheckbox.id = "searchAsMove"
  controlCheckbox.style.width = "18px";
  controlCheckbox.style.height = "18px";
  controlCheckbox.style.verticalAlign = "text-bottom";
  controlInnerDiv.appendChild(controlCheckbox);
  
  var controlText = document.createElement("label");
  controlText.for = "searchAsMove";
  controlText.innerHTML = "Search as I move the map";
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '5px';
  controlInnerDiv.appendChild(controlText);
}