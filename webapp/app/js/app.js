'use strict';

/* App Module */
angular.module('greenhouse', ['http-auth-interceptor', 'ngCookies', 'credentials']).run(
        ['$rootScope', '$http', "$cookies", "authService", "$credentials", "$timeout",
            function($rootScope, $http, $cookies, $authService, $credentials, $timeout) {

              // when auth-loginRequired => ask authentification
              $rootScope.$on('event:auth-loginRequired', function() {

                // create authentification request
                var url = "/api/oauth/token?grant_type=password&";
                url += "username=" + encodeURIComponent($credentials.username) + "&";
                url += "password=" + encodeURIComponent($credentials.password) + "&";
                url += "client_id=" + $credentials.client_id + "&";
                url += "client_secret=" + $credentials.client_secret;

                // send it
                $http.post(url).success(function(data, status, headers, config) {
                  // authenfication succeed, we store access token in a
                  // cookie
                  $cookies.avop_access_token = data.access_token;
                  // and retry to launch request
                  $authService.loginConfirmed();
                }).error(function(data, status, headers, config) {
                  // authenfication failed, we retry in 3 seconds.
                  console.log("portal authentification failed : " + status);
                  console.log("retry in 3 seconds : " + status);
                  $timeout($authService.loginConfirmed, 3000);
                });
              });
            }]);
