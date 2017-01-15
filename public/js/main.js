/**
 * Main AngularJS Web Application
 */
var app = angular.module('WebApp', [
  'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    // Pages
    .when("/track", {templateUrl: "partials/track.html", controller: "TrackCtrl"})
    .when("/create", {templateUrl: "partials/create.html", controller: "CreateCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html"});
}]);

/**
 * Controls the card tracking
 */
app.controller('TrackCtrl', function (/* $scope, $location, $http */) {
  console.log("Track Controller reporting for duty.");
});

/**
 * Controls the card creation
 */
app.controller('CreateCtrl', function (/* $scope, $location, $http */) {
  console.log("Create Controller reporting for duty.");
});

/**
 * Controls all other Pages
 */
app.controller('HomeCtrl', function (/* $scope, $location, $http */) {
  console.log("Page Controller reporting for duty.");

});