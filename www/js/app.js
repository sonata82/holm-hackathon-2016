// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('init', {
      url: '/init',
      controller: function ($rootScope, $state, $ionicHistory, ExistsConnectingFlight, ExistsArrivingFlight) {
        console.log('Initialising...', ExistsArrivingFlight);

        $ionicHistory.currentView($ionicHistory.backView());
        if (ExistsArrivingFlight && ExistsArrivingFlight.toNow !== -1) {
          $state.go('landing');
        } else {
          $state.go('arriving');
        }
      },
      resolve: {
        'Order': function ($rootScope) {
          $rootScope.order = 'ord_003';
        },
        'LufthansaToken': function (Lufthansa) {
          return Lufthansa.authenticate();
        },
        'ExistsConnectingFlight': function (Order, LufthansaToken, Flights) {
          return Flights.existsConnectingFlight();
        },
        'ExistsArrivingFlight': function (Order, LufthansaToken, Flights) {
          return Flights.existsArrivingFlight();
        }
      }
    })

    .state('landing', {
      url: '/landing',
      templateUrl: 'templates/list.html',
      controller: 'ListController',
      resolve: {
        'Order': function ($rootScope) {
          $rootScope.order = 'ord_002';
        },
        'LufthansaToken': function (Lufthansa) {
          return Lufthansa.authenticate();
        }
      }
    })

    .state('baggage', {
      url: '/baggage',
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    })

    .state('shopping', {
      url: '/shopping',
      templateUrl: 'templates/list.html',
      controller: 'ListController',
      resolve: {
        'Order': function ($rootScope) {
          $rootScope.order = 'ord_002';
        },
        'LufthansaToken': function (Lufthansa) {
          return Lufthansa.authenticate();
        }
      }
    })

    .state('eating', {
      url: '/eating',
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    })
    .state('arriving', {
      url: '/arriving',
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    })

    .state('navigation', {
      url: '/navigation',
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    })

    .state('train', {
      url: '/train',
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })
  .state('tab.beacons', {
    url: '/beacons',
    views: {
      'tab-beacons': {
        templateUrl: 'templates/tab-beacons.html'
      }
    }
  })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/init');

});
