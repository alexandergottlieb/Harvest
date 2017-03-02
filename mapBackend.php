<?php 

$testItems = array(array(
    "lat" => 54.767953, 
    "lng" => -1.574685,
    "id" => 0,
    "type" => 'food',
    "name" => "Burger"
  ),
  array(
    "lat" => 54.766672,
    "lng" => -1.575490,
    "id" => 1,
    "type" => 'meat',
    "name" => "Fresh Pork"
  ),
  array(
    "lat" => 54.767706, 
    "lng" => -1.572749,
    "id" => 2,
    "type" => 'fruit',
    "name" => "Bananas"
  ),
  array(
    "lat" => 54.767898,
    "lng" => -1.571783,
    "id" => 3,
    "type" => 'veg',
    "name" => "Carrots"
  )
);

$map;
$position = array(54.767563, -1.570737);
$markers = array();
$windows = array();

$icons = array(
  "food" => array( 
    "icon" => "Images/burgerResized.png"
  ),
  "foodSelected" => array(
    "icon" => "Images/burger2Resized.png"
  ),
  "fruit" => array( 
    "icon" => "Images/testFruit.png"
  ),
  "fruitSelected" => array(
    "icon" => "Images/testFruitSelected.png"
  ),
  "veg" => array(
    "icon" => "Images/testVeg.png"
  ),
  "vegSelected" => array( 
    "icon" => "Images/testVegSelected.png"
  ),
  "meat" => array(
    "icon" => "Images/testMeat.png"
  ),
  "meatSelected" => array(
    "icon" => "Images/testMeatSelected.png"
  ),
);

function addItem($lat, $lng, $id, $type) {
  // items.push({lat: lat, lng: lng, id: id, type: type});
	array_push($testItems, array(lat => $lat, lng => $lng, id => $id, type => $type));
}

function removeItem($id) {
  $i = 0;
  foreach ($testItems as $item) {
  	if ($testItem["id"] == $id) {
  		unset($testItems[$i]);
  	}
  	$i++;
  }
} 

function rad($x) {
	return $x * pi() / 180;
}

function getDistance($p1, $p2) {
  $R = 6378137; // Earth’s mean radius in meter
  $dLat = rad($p2["lat"] - $p1["lat"]);
  $dLong = rad($p2["lng"] - $p1["lng"]);
  $a = sin($dLat / 2) * sin($dLat / 2) +
    cos(rad($p1["lat"])) * cos(rad($p2["lat"])) *
    sin($dLong / 2) * sin($dLong / 2);
  $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
  $d = $R * $c;
  return $d; // returns the distance in meter
};

function getItems($testItems) {
	// SQL statements to fetch items given the $_GET criteria, in the mean while it just returns all items
	// echo $_SERVER["QUERY_STRING"]."\r\n";
	$results = array();
	$location = array("lat" => $_GET["lat"], "lng" => $_GET["lng"]);
	
 $query = array();
  if (isset($_GET["expiry"])) {
    $expiry;
    if ($_GET["expiry"] == 1) {
      $expiry = date("Y-m-d");
    }
    else if ($_GET["expiry"] == 2) {
      $expiry = new date("Y-m-d", strtotime("+1 day"));
    }
    else if ($_GET["expiry"] == 3) {
      $expiry = new date("Y-m-d", strtotime("+1 week"));
    }
    else if ($_GET["expiry"] == 4) {
      $expiry = new date("Y-m-d", strtotime("+1 year"));
    }
    $query["expiry"] = $expiry;
  }

  if (isset($_GET["type"])) {
    $type;
    if ($_GET["type"] == 1) {
      $type = "fruit";
    }
    else if ($_GET["type"] == 2) {
      $type = "veg"; 
    }
    else if ($_GET["type"] == 3) {
      $type = "meat";
    }
    $query["type"] = $type;
  }

  if (isset($_GET["distance"])) {
    foreach($testItems as $item) {
      $distance = getDistance($location, $item) * 0.000621371;
			if ($distance <= $_GET["distance"]) {
				$item["distance"] = round($distance, 2)." miles"; 
        array_push($results, $item);
			}
		}
    return $results;
  }
  else {
    return $testItems;
  }
}

if (!empty($_GET)) {
  if (isset($_GET["items"])) {
    echo json_encode(getItems($testItems));
	}
}

?>