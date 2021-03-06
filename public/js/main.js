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
app.controller('CheckinCtrl', function ($scope, uiGmapGoogleMapApi, $firebaseObject, $location) {
  console.log("Checkin Controller reporting for duty.");

  var ref = firebase.database().ref();

  $scope.checkin = function() {

    var comment = {"comment":$scope.comment};
    var myDest = {};

    angular.extend(myDest, $scope.map.marker, comment )

    var newRef = ref.child($scope.trackID + "/pings").push({
        location: myDest,
      });

    $location.path('/track');

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
    firebase.database().ref($scope.trackID).once('value').then(function(snapshot) {
      var query = firebase.database().ref($scope.trackID + "/pings").orderByKey();
      query.once("value")
        .then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var location = childSnapshot.child("location").val();
            $scope.map.markers.push(location);
          });
          $scope.makeLines();
          $('#mapdiv').removeClass("hidden");
          $scope.map.mapControl.refresh();
        });
    });
  };

  $scope.makeLines = function() {
    for (i = 0; i < $scope.map.markers.length - 1; i++) {
      $scope.map.polyline.push(
            {
              id: i,
              path: [],
              stroke: {
                  color: '#6060FB',
                  weight: 3
              },
              geodesic: false,
              visible: true,
              icons: [{
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                },
                offset: '2px'
              }]
            });
      $scope.map.polyline[i].path.push($scope.map.markers[i].coords,$scope.map.markers[i+1].coords);
    }
  }

  //set initial marker value
  uiGmapGoogleMapApi.then(function(maps) {
    $scope.map.markers = [];
    $scope.map.polyline = [];
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
            mapControl: {},
        }
      });
});

/**
 * Controls the card creation
 */
app.controller('CreateCtrl', function ($scope, $firebaseObject) {
  console.log("Create Controller reporting for duty.");

  $scope.uid = "";
  var i = 0;
  $scope.getID = function() {
    newUid = (0|Math.random()*9e6).toString(36);
    $scope.checkID(newUid);
  };

    $scope.checkID = function(newUid) {
      firebase.database().ref().once('value', function(snapshot) {
      if (snapshot.hasChild(newUid)) {
        $scope.getID();
      }
      else {
        $scope.displayId(newUid);
      }
    });
    }

  $scope.displayId = function(newUid){
    var newRef = firebase.database().ref(newUid).set({
        created: Date.now()
      });
    $scope.uid = newUid;
    $scope.$apply();
    $scope.drawCanvas();
  };
});

app.directive('card', function () {
      return {
        restrict: 'EA',
        template:'<canvas></canvas>',
        replace:true,
        link: function (scope, el, attrs) {

          scope.upperText = "";
          scope.fontsize = 30;
          var c = el[0];   
            c.height = 400;
          var ctx = c.getContext("2d");
           
 
          scope.drawCanvas = function () {

            c.width = c.width;
            ctx.font = scope.fontsize + "px  Impact";
            //ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            var x = c.width / 2;
            var y = c.height / 3;
            ctx.textAlign = 'center';
            //ctx.fillText(scope.upperText, x, y);
            wrapText(ctx, scope.upperText, x, y, c.width-40, 30);
            //ctx.lineWidth = 2;
            //ctx.strokeText(scope.upperText, x, y);

            ctx.lineWidth = 5;

            ctx.strokeStyle = '#000000';
            ctx.strokeRect(10, 10, 259, 387);

            ctx.lineWidth = 11;

            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(10, 100);
            ctx.lineTo(270, 100);
            ctx.stroke();
            ctx.closePath();

            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(10, 300);
            ctx.lineTo(270, 300);
            ctx.stroke();
            ctx.closePath();

            var x = 50;
            var y = c.height - 50;
            ctx.font = "30px  Impact";
            ctx.textAlign = 'left';
            ctx.fillText("ID:" + scope.uid, x, y);

            switch (scope.type) {
              case "good":
                ctx.fillStyle = "red";
                break;
              case "adventure":
                ctx.fillStyle = "blue";
                break;
              case "meet":
                ctx.fillStyle = "green";
                break;
              case "kill":
                ctx.fillStyle = "black";
                break;
              default:
                ctx.fillStyle = "white";
            }

            ctx.beginPath();
            ctx.rect(13, 13, 253, 85);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.stroke();
          };

          function wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';

            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ';
              var metrics = context.measureText(testLine);
              var testWidth = metrics.width;
              if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
              }
              else {
                line = testLine;
              }
            }
            context.fillText(line, x, y);
          }
        }
      }
    });

/**
 * Controls all other Pages
 */
app.controller('HomeCtrl', function (/* $scope, $location, $http */) {
  console.log("Page Controller reporting for duty.");

});