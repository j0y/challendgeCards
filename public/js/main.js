/**
 * Main AngularJS Web Application
 */
var app = angular.module('WebApp', [
  'ngRoute',
  'uiGmapgoogle-maps',
  'firebase'
]);

app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBqoa1ZLYZ-za9w8KxhZlWVcNxtP_J0Ni8',
        v: '3.26', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    // Pages
    .when("/checkin", {templateUrl: "partials/checkin.html", controller: "CheckinCtrl"})
    .when("/track", {templateUrl: "partials/track.html", controller: "TrackinCtrl"})
    .when("/create", {templateUrl: "partials/create.html", controller: "CreateCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html"});
}]);

/**
 * Controls the card checkining
 */
app.controller('CheckinCtrl', function ($scope, uiGmapGoogleMapApi, $firebaseObject) {
  console.log("Checkin Controller reporting for duty.");

  var ref = firebase.database().ref();

  $scope.checkin = function() {
    console.log($scope.trackID);
    console.log($scope.comment);
    console.log($scope.map.marker);

    var comment = {"comment":$scope.comment};
    var myDest = {}  ;

    angular.extend(myDest, $scope.map.marker, comment )

    var newRef = ref.child($scope.trackID + "/pings").push({
        location: myDest,
      });

  };

  //set initial marker value
  uiGmapGoogleMapApi.then(function(maps) {
    $scope.map.marker = { id: Date.now() };
  });

  angular.extend($scope, {
        map: {
            center: {
                latitude: 55.3435941,
                longitude: 86.0614013
            },
            zoom: 11,
            streetViewControl: false,
            events: {
            click: function (map, eventName, originalEventArgs) {
                var e = originalEventArgs[0];
                var lat = e.latLng.lat(),lon = e.latLng.lng();
                var marker = {
                    id: Date.now(),
                    coords: {
                        latitude: lat,
                        longitude: lon
                    }
                };
                $scope.map.marker = marker;
                $scope.$apply();
            }
        }
        }
      });
});

/**
 * Controls the card trackining
 */
app.controller('TrackinCtrl', function ($scope, uiGmapGoogleMapApi, $firebaseObject, $timeout) {
  console.log("Trackin Controller reporting for duty.");

  var ref = firebase.database().ref();
  

  $scope.track = function() {
    $scope.map.markers = [];
    console.log($scope.trackID);
    firebase.database().ref($scope.trackID).once('value').then(function(snapshot) {
    var card = snapshot.val();
    console.log(card);

    var query = firebase.database().ref($scope.trackID + "/pings").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var location = childSnapshot.child("location").val();
          $scope.map.markers.push(location);
        });
      });
    });
    console.log($scope.map.markers);

    //$scope.map.control.refresh();

    var bounds = new google.maps.LatLngBounds();
    for (var i=0; i<$scope.map.markers.length; i++) {
      var latlng = new google.maps.LatLng($scope.map.markers[i]["coords"]["latitude"], $scope.positions[i]["coords"]["longitude"]);
      bounds.extend(latlng);
    }
    
    $scope.$watch($scope.map.mapControl, function(){
      $scope.map.mapControl.getGMap().fitBounds(bounds);
    });
   

    $timeout(function() {
        $scope.map.mapControl.getGMap().fitBounds(bounds);
    }, 100);
    $scope.map.show = true;
  };

  //set initial marker value
  uiGmapGoogleMapApi.then(function(maps) {
    $scope.map.markers = [];
    $scope.map.control = {};
  });
  
  angular.extend($scope, {
        map: {
            center: {
                latitude: 55.3435941,
                longitude: 86.0614013
            },
            zoom: 11,
            streetViewControl: false,
            bounds: {},
            mapControl: {}
        }
      });
});

/**
 * Controls the card creation
 */
app.controller('CreateCtrl', function ($scope, $firebaseObject) {
  console.log("Create Controller reporting for duty.");

  var ref = firebase.database().ref();

  $scope.getID = function() {
  
  var unique = false;
  var i = 0;
    do {
      i++;
      var randomUid = (0|Math.random()*9e6).toString(36);
      unique = checkIfIDExists(randomUid);
      if (unique) {
        break;
      }
      console.log(randomUid + " - " + unique);

      }
    while (i<10);

    newUid = randomUid;

    var newRef = ref.push({
        uid: newUid,
        created: Date.now()
      });
    $scope.uid = newRef.key;
    console.log(newRef.key);
  };

  function checkIfIDExists(uid) {
  var Ref = firebase.database().ref();
  Ref.child(uid).once('value', function(snapshot) {
    return snapshot.exists();
  });
}
  
});

/**
 * Controls all other Pages
 */
app.controller('HomeCtrl', function (/* $scope, $location, $http */) {
  console.log("Page Controller reporting for duty.");

});