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

function addItemToMap(item) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(item["lat"], item["lng"]),
    icon: icons[item["type"]].icon,
    type: item["type"],
    map: map,
    id: item["id"]
  });
  markers.push(marker);

  var infowindow = new google.maps.InfoWindow({
    content: ("<div class='container-fluid customInfoWindow'><h3 col-xs-12>" + item["name"] + "</h3><p>Item id: " + marker.id + "</p><p>ITEM LOCATION</p><p>ITEM QUANTITY</p><button class='btn btn-primary btn-block collectItemButton' name='" + marker.id + "'>Collect</button></div>"),
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

function addItemToItemsList(item) {
  var itemList = $(document).find(".item_display");
  var itemSuperContainer = $("<div class='row list-group'></div>");
  var itemContainer = $("<div class='list-group-item item_title col-xs-10 col-xs-offset-1'></div>")
  var itemImage = $("<div class='col-lg-4'><img src='banana.png' class='item_tile_image'></div>");
  var itemInfoContainer = $("<div class='col-lg-4'><h5 class='item_tile_name'>" + item["name"] + "</h5><p class='item_tile_distance'>" + item["distance"] + "</p><p class='item_tile_description'>Item Description</p></div>");
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

function getItems(query) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  windows = [];

  $.ajax({
    type: "GET",
    url: "mapBackend.php?items&lat=" + position[0] + "&lng=" + position[1] + "&" + query,
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

      var index = query.indexOf("distance=");
      // alert(query[index + 9] + query[index + 10]);
      if (!(isNaN(query[index + 9] + query[index + 10]))) {
        drawRadius(query[index + 9] + query[index + 10]);
      }
      else {
        drawRadius(query[index + 9]);
      }
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
    // center: "Bedford",
    mapTypeId: 'roadmap'
  });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(newPosition) {
      var pos = {
        lat: newPosition.coords.latitude,
        lng: newPosition.coords.longitude
      };

      map.setCenter(pos);
      position = [newPosition.coords.latitude, newPosition.coords.longitude];
      // draw radius circle
      drawRadius(5);

      // redrawMap();
      getItems("distance=5");

    }, function() {
      alert("Error fetching your location");
      // draw radius circle
      drawRadius(5);

      // redrawMap();
      getItems("distance=5");
    });
  } else {
    // Browser doesn't support Geolocation
    alert("Sorry, your browser does not offer geolocation");
    // draw radius circle
    drawRadius(5);

    // redrawMap();
    getItems("distance=5");
  }
}