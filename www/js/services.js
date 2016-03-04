angular.module('starter.services', ['starter.api_keys'])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?!',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

  .factory('LH', function ($http, LH_CREDENTIALS) {
    var token;

    $http.post('https://api.lufthansa.com/v1/oauth/token', {
      client_id: LH_CREDENTIALS.CLIENT_ID,
      client_secret: LH_CREDENTIALS.CLIENT_SECRET,
      grant_type: "client_credentials"
    }).then(function (data) {
      console.log(data);
    });

    return {
      getToken: function () {
        return token;
      }
    }
  })

.factory('Baggage', function ($rootScope, $http, $q, LH) {
   return {
     isBaggageAvailable: function () {
       var deferred = $q.defer();

       $http.get('https://api-test.lufthansa.com/v1/mockup/profiles/orders/' + $rootScope.order + '?callerid=' + LH.getToken()).then(function (data) {

       });

       return deferred.promise;
     },
     timeToBaggageInMinutes: function () {
       return 11;
     }
   };
})

.factory('Flights', function () {
  return {
    existsConnectingFlight: function () {
      return true;
    },
    timeToConnectingFlighInMinutes: function () {
      return 64;
    }
  }
});
