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

  .factory('Lufthansa', function ($http, $q, LH_API) {
    var token,
      orders = {};

    return {
      authenticate: function () {
        return $http({
          method: 'POST',
          url: LH_API.ENDPOINT_TEST + '/oauth/token',
          data: {
            client_id: LH_API.CLIENT_ID,
            client_secret: LH_API.CLIENT_SECRET,
            grant_type: "client_credentials"
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          }
        }).then(function (result) {
          console.log(result);

          token = result.data.access_token;
        });
      },
      getToken: function () {
        return token;
      },
      getServiceUrl: function () {
        return LH_API.ENDPOINT_TEST;
      },
      getCallerId: function () {
        return 'team1';
      },
      getOrder: function () {

      }
    }
  })

  .factory('Fraport', function ($http, FRAPORT_API) {
    var beacons = [];

    $http.get(FRAPORT_API.ENDPOINT + '/1', {
      airportCode: 'FRA',
      app_id: FRAPORT_API.APP_ID,
      app_key: FRAPORT_API.APP_KEY
    }).then(function (data) {
      console.log('fraport:', data);
    });

    return {
      getBeacons: function (type) {

      }
    }

  })

.factory('Baggage', function ($rootScope, $http, $q, Lufthansa) {
   return {
     isBaggageAvailable: function () {
       var deferred = $q.defer();

       $http({
         url: Lufthansa.getServiceUrl() + '/mockup/profiles/orders/' + $rootScope.order + '?callerid=' + Lufthansa.getCallerId(),
         headers: {
           'Authorization': 'Bearer ' + Lufthansa.getToken()
         }
       }).then(function (result) {
         var Flight = result.data.OrdersResponse.Orders.Order.OrderItems.OrderItem.FlightItem.OriginDestination.Flight,
           lastOrder = Flight[Flight.length - 1];

         if (lastOrder.Arrival.AirportCode == 'FRA') {
           if (lastOrder.BaggageItem.BagDetails.BagDetail.CheckedBags.TotalQuantity > 0) {
             return deferred.resolve(true);
           }
         }
         deferred.resolve(false);
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
    timeToConnectingFlightInMinutes: function () {
      return 64;
    }
  }
});
