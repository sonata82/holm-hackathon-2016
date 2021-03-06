angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('ExampleController', function($scope, $rootScope, $ionicPlatform, $cordovaBeacon) {

  $scope.beacons = {};

  $ionicPlatform.ready(function() {

    if ($cordovaBeacon) {
      $scope.didRangeBeaconsInRegionLog = '-----' + '\n';
      $scope.didRangeBeaconsInRegionLog += 'Activating...' + '\n';

      //$cordovaBeacon.requestWhenInUseAuthorization();

      $rootScope.$on('$cordovaBeacon:didRangeBeaconsInRegion', function(event, pluginResult) {
        $scope.didRangeBeaconsInRegionLog += '-----' + '\n';
        $scope.didRangeBeaconsInRegionLog += JSON.stringify(pluginResult) + '\n';

        var uniqueBeaconKey;
        for(var i = 0; i < pluginResult.beacons.length; i++) {
          uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
          $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
        }
        $scope.$apply();
      });

      $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion('estimote', 'f7826da6-4fa2-4e98-8024-bc5b71e0893e'));
    } else {
      $scope.didRangeBeaconsInRegionLog = '-----' + '\n';
      $scope.didRangeBeaconsInRegionLog += 'Not available!' + '\n';
    }
  });
})

.controller('ListController', function ($scope, $state, Baggage, Flights, Fraport, Location, DeutscheBahn) {
    console.log($state.current.name);
    $scope.items = [];

    switch($state.current.name) {
      case 'landing':
        $scope.name = 'What would you like to do? (' + $state.current.name + ')';
        Baggage.isBaggageAvailable().then(function (isBaggageAvailable) {
          if (isBaggageAvailable) {
            $scope.items.push({
              title: 'Claim your baggage',
              state: 'baggage',
              icon: 'ion-briefcase'
            });
          }
        });
        DeutscheBahn.getNextConnectionToHome().then(function (connection) {
          $scope.items.push({
            title: 'Next train home',
            state: 'train',
            additionalData: connection.name + ' from track ' + connection.track + ' at ' + connection.time,
            icon: 'ion-android-train'
          })
        });
        break;
      case 'baggage':
      case 'arriving':
        $scope.name = 'What would you like to do? (' + $state.current.name + ')';
        if (Baggage.timeToBaggageInMinutes() > 10) {
          $scope.items.push({
            title: 'Go for some shopping?',
            state: 'shopping',
            icon: 'ion-bag'
          },
          {
            title: 'Are you hungry?',
            state: 'eating',
            icon: 'ion-pizza'
          });
        }
        break;
      case 'shopping':
        $scope.name = 'Here are some stores (' + $state.current.name + ')';
        Fraport.getBeacons('Retail').then(function(shops) {
          console.log('shops:',shops);

          Location.getMyLocation().then(function (myLocation) {
            for (var shop in shops) {
              $scope.items.push({
                title: shops[shop].name,
                additionalData: Location.getDistance(shops[shop].latitude, shops[shop].longitude, myLocation.latitude, myLocation.longitude),
                state: 'navigation'
              })
            }
          });
        });
        break;
      case 'eating':
        $scope.name = 'Here are some restaurants (' + $state.current.name + ')';
        Fraport.getBeacons('Food').then(function(shops) {
          Location.getMyLocation().then(function (myLocation) {
            for (var shop in shops) {
              $scope.items.push({
                title: shops[shop].name,
                additionalData: Location.getDistance(shops[shop].latitude, shops[shop].longitude, myLocation.latitude, myLocation.longitude),
                state: 'navigation'
              })
            }
          });
        });
        // baggage?
        // plane leaving?
        // train leaving?
        break;
    }

    Flights.existsConnectingFlight().then(function (nextFlightInfo) {
      if (nextFlightInfo) {
        if (nextFlightInfo.toNow !== -1) {
          $scope.nextItem = {
            description: 'Your flight leaves ' + nextFlightInfo.toNow
          }
        }
      }
    });
});
