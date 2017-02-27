$(document).on("click", ".collectItemButton", function() {
  alert("COLLECTING ITEM: " + $(this).attr("name"));
})

var map;
var position = [54.767563, -1.570737];
var markers = [];
var windows = [];

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

var items = [
  {
    lat: 54.767953, 
    lng: -1.574685,
    id: 0,
    type: 'food'
  },
  {
    lat: 54.766672,
    lng: -1.575490,
    id: 1,
    type: 'meat'
  },
  {
    lat: 54.767706, 
    lng: -1.572749,
    id: 2,
    type: 'fruit'
  },
  {
    lat: 54.767898,
    lng: -1.571783,
    id: 3,
    type: 'veg'
  }
];

function addItem(lat, lng, id, type) {
  items.push({lat: lat, lng: lng, id: id, type: type});
}

function removeItem(id) {
  items.forEach(function(item, i) {
    if (item["id"] == id) {
      delete items[i];
    }
  });
  redrawMap();
}

function resetMap() {
  markers.forEach(function(marker) {
    marker.setIcon(icons[marker.type]["icon"]);
  });
  windows.forEach(function(window) {
    window.close();
  });
}

function redrawMap() {
  // for (var i = 0; i < markers.length; i++) {
  //   markers[i].setMap(null);
  // }
  markers = []
  addMarkers();
}

function addMarkers() {
  items.forEach(function(item) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(item.lat, item.lng),
      icon: icons[item.type].icon,
      type: item.type,
      map: map,
      id: item.id
    });
    markers.push(marker);

    var infowindow = new google.maps.InfoWindow({
      content: ("<div class='container-fluid customInfoWindow'><h3 col-xs-12>ITEM NAME</h3><p>Item id: " + marker.id + "</p><p>ITEM LOCATION</p><p>ITEM QUANTITY</p><button class='btn btn-primary btn-block collectItemButton' name='" + marker.id + "'>Collect</button></div>")
    });
    windows.push(infowindow);

    marker.addListener("click", function() {
      resetMap();
      if (marker.icon == marker.type + "Selected") {
        alert("TESTING");
      }
      marker.setIcon(icons[marker.type + "Selected"]["icon"]);
      infowindow.open(map, marker);
    })

    google.maps.event.addListener(infowindow, 'closeclick', function() {  
        resetMap();
    }); 
  })
}

function filterMarkersByType(criteria) {
  if (criteria.length > 0) {
    markers.forEach(function(marker) {
      if (criteria.indexOf(marker["type"]) == -1) {
        marker.setMap(null)
      }
    });
  }
}

function filterMarkersByDistance(distance) {
  var p1 = new google.maps.LatLng(position[0], position[1]);
  markers.forEach(function(marker) {
    if (getDistance(p1, marker.position) > distance) {
      marker.setMap(null);
    }
  });
}

var rad = function(x) {
  return x * Math.PI / 180;
};

function getDistance(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: new google.maps.LatLng(position[0], position[1]),
    mapTypeId: 'roadmap'
  });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);
    }, function() {
      alert("Error fetching your location");
    });
  } else {
    // Browser doesn't support Geolocation
    alert("Sorry, your browser does not offer geolocation");
  }

  redrawMap();
  // filterMarkersByType(["meat"])
  // filterMarkersByDistance(100);
}