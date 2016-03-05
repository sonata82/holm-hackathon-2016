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
        if (token) {
          return token;
        }
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
      getOrder: function (orderId) {
        var order = $q.defer();

        $http({
          url: this.getServiceUrl() + '/mockup/profiles/orders/' + orderId + '?callerid=' + this.getCallerId(),
          headers: {
            'Authorization': 'Bearer ' + this.getToken()
          }
        }).then(function (result) {
          var orderItem = result.data.OrdersResponse.Orders.Order.OrderItems.OrderItem;

          order.resolve(orderItem.length ? orderItem[0].FlightItem : orderItem.FlightItem);
        });

        return order.promise;
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

.factory('Baggage', function ($rootScope, $q, Lufthansa) {
   return {
     isBaggageAvailable: function () {
       var deferred = $q.defer();

       Lufthansa.getOrder($rootScope.order).then(function (flightItem) {
         var Flight = flightItem.OriginDestination.Flight,
           lastOrder = Flight.length ? Flight[Flight.length - 1] : Flight;

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

.factory('Flights', function ($rootScope, $q, Lufthansa) {
  return {
    existsConnectingFlight: function () {
      var deferred = $q.defer();

      Lufthansa.getOrder($rootScope.order).then(function (flightItem) {
        var Flight = flightItem.OriginDestination.Flight,
          currentOrder, nextOrder;

        if (Flight.length) {
          for (var i = 0, l = Flight.length; i < l; i++) {
            if (Flight[i].Arrival.AirportCode == 'FRA') {
              currentOrder = Flight[i];
              if (Flight[i+1]) {
                nextOrder = Flight[i+1];
              }
              break;
            }
          }
        } else {
          nextOrder = Flight;
        }

        if (nextOrder) {
          var departureMoment = moment(nextOrder.Departure.Date + " " + nextOrder.Departure.Time);
          return deferred.resolve({
            toNow: departureMoment.isAfter(moment()) ? departureMoment.fromNow() : -1
          });
        }

        deferred.resolve();
      });

      return deferred.promise;
    },

    existsArrivingFlight: function () {
      var deferred = $q.defer();

      Lufthansa.getOrder($rootScope.order).then(function (flightItem) {
        var Flight = flightItem.OriginDestination.Flight,
          currentOrder;

        console.log(Flight);

        if (Flight.length) {
          for (var i = 0, l = Flight.length; i < l; i++) {
            if (Flight[i].Arrival.AirportCode == 'FRA') {
              currentOrder = Flight[i];
              break;
            }
          }
        } else {
          currentOrder = Flight;
        }

        if (currentOrder) {
          var departureMoment = moment(currentOrder.Departure.Date + " " + currentOrder.Departure.Time);
          return deferred.resolve({
            toNow: departureMoment.isBefore(moment()) ? departureMoment.fromNow() : -1
          });
        }

        deferred.resolve();
      });

      return deferred.promise;
    }
  }
});
