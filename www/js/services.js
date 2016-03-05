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

  .factory('Fraport', function ($http, $q, FRAPORT_API) {
    var beaconsByType = {};

    return {
      getBeacons: function (type) {
        var deferred = $q.defer();

        $http({url: FRAPORT_API.ENDPOINT + '/1', params:{
          airportCode: 'FRA',
          app_id: FRAPORT_API.APP_ID,
          app_key: FRAPORT_API.APP_KEY
        }}).then(function (results) {
          console.log('fraport:', results.data);

          for (var i= 0, l = results.data.length; i < l; i++) {
            var beaconType = results.data[i].beaconType;
            if (!beaconsByType[beaconType]) {
              beaconsByType[beaconType] = []
            }
            beaconsByType[beaconType].push(results.data[i]);
          }

          deferred.resolve(beaconsByType[type]);
        });

        return deferred.promise;
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
})

.factory('Location', function ($cordovaGeolocation, $q) {

    /** Converts numeric degrees to radians */
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    /**
     * Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011
     * - www.movable-type.co.uk/scripts/latlong.html
     *
     * where R is earth’s radius (mean radius = 6,371km);
     * note that angles need to be in radians to pass to trig functions!
     */
    var getDistance = function (lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = (lat2-lat1).toRad();
      var dLon = (lon2-lon1).toRad();
      var lat1 = lat1.toRad();
      var lat2 = lat2.toRad();

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;
      return Math.round(d);
    };

    return {
      getMyLocation: function () {
        var deferred = $q.defer();

        $cordovaGeolocation
          .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
          .then(function (position) {
            deferred.resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          });

        return deferred.promise;
      },

      getDistance: function (latitude1, lonitude1, latitude2, longitude2) {
        return getDistance(latitude1, lonitude1, latitude2, longitude2);
      }
    }
}).

factory('DeutscheBahn', function ($http, $q, DB_API) {
    return {
      getNextConnectionToHome: function () {
        var deferred = $q.defer();

        $http({
          url: DB_API.ENDPOINT + '/departureBoard',
          params: {
            format: 'json',
            authKey: DB_API.AUTH_KEY,
            id: 'FFLF',
            date: moment().format('YYYYMMDD'),
            time: moment().format('HHmm'),
            direction: '8000207'
          }
        }).then(function (result) {
          console.log('result:', result.data.DepartureBoard.Departure[0]);

          var nextTrain = result.data.DepartureBoard.Departure[0];

          deferred.resolve({
            name: nextTrain.name,
            track: nextTrain.track,
            time: nextTrain.time,
            toNow: moment(nextTrain.date + nextTrain.time).toNow()
          });
        });

        return deferred.promise;
      }
    }
});
