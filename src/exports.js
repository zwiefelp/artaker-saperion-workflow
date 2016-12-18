define(['./js/mainModule', './js/util/loginHandler', 'less!./styles/styles'],
    function (MainModule, LoginHandler) {
        'use strict';

        var exports = {
            MainModule: MainModule,
            LoginHandler: LoginHandler
        };

        return exports;
    });
