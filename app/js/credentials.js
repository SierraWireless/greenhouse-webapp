'use strict';

angular.module('credentials',[]).
factory('$credentials', function () {
	var credentials = {
		"username" : "my@login.com",
		"password" : "pwd1234",
		"client_id" : "1238483aace5r571b65a431498cd24d1",
		"client_secret" : "123ea955b0334e4db095bed1752d3fa6",
		"system_id" : "123a2d873df34f6bb7fa17351aa40e20"}
      return credentials;
});
