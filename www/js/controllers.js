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

.controller('ListController', function ($scope, $state, Baggage, Flights) {
    console.log($state.current.name);
    $scope.name = $state.current.name;
    $scope.items = [];

    switch($state.current.name) {
      case 'landing':
        Baggage.isBaggageAvailable().then(function () {
          $scope.items.push({
            title: 'Claim your baggage',
            state: 'baggage'
          });
        });
        // baggage?
        // train?
        break;
      case 'baggage':
      case 'arriving':
        if (Baggage.timeToBaggageInMinutes() > 10) {
          $scope.items.push({
            title: 'Go for some shopping?',
            state: 'shopping'
          },
          {
            title: 'Hungry?',
            state: 'eating'
          })
        }
        break;
      case 'shopping':
      case 'eating':
        // baggage?
        // plane leaving?
        // train leaving?
        break;
    }

    if (Flights.existsConnectingFlight()) {
      $scope.nextItem = {
        description: 'You flight leaves in ' + Flights.timeToConnectingFlighInMinutes() + ' minutes'
      }
    } else {
      $scope.items.push({
        title: 'Train to home'
      });
    }

    console.log($scope.items);
    //  ,
    //  {
    //    title: 'Go shopping'
    //  },
    //  {
    //    title: 'Get something to eat'
    //  }
    //]
});
