/**
 * LoginHandler provides login functionality for the experience shell.
 */
define(['framework-core', 'framework-controls', 'logger', 'util/appContext', 'util/messageHandler', 'util/resourceHandler'],
    function (Core, Controls, Logger, AppContext, MessageHandler, ResourceHandler) {
        'use strict';

        var loggedIn = false;
        var currentUser = {};
        var appContext = {};
        var serverInfo = {};
        var auth = {};
        var serviceCookie = '';

        /**
         * Constructor initializes app context and reads session information.
         */
        function LoginHandler() {

            //Initialize AppContext and set callbacks
            var messageHandler = new MessageHandler();
            var resourceHandler = new ResourceHandler();

            this.appContextCallbacks = {
                "log": messageHandler.log,
                "getLogLevels": messageHandler.getLogLevels,
                "showErrorAlert": messageHandler.showErrorAlert,
                "showWarningAlert": messageHandler.showWarningAlert,
                "showInfoAlert": messageHandler.showInfoAlert,
                "localize": resourceHandler.localize
            };

            appContext = AppContext.getInstance(this.appContextCallbacks);
            serverInfo = appContext.getCurrentServerInfo();
            serviceCookie = appContext.localStorage.getData('token');
            loggedIn = appContext.localStorage.getData('isLoggedIn');
        }

        /**
         * Resets all login information.
         */
        function resetLoginInformation() {
            loggedIn = false;
            appContext.localStorage.setData('token', '');
            appContext.localStorage.setData('isLoggedIn', loggedIn);
            currentUser = {};
        }

        /**
         * Registration for needed events.
         */
        LoginHandler.prototype = Core.Events.enableFor({

            /**
             * getUsername callback, returns current user.
             */
            getUsername: function () {
                return currentUser.shortName;
            },

            /**
             * isLoggedIn callback, checks if user token is still valid.
             */
            isLoggedIn: function () {
                var self = this;
                var spinningWheel = {};

                try {
                    // token based authentication
                    if (typeof serviceCookie !== 'undefined' && serviceCookie !== null && loggedIn === "true") {
                        spinningWheel = Controls.ProgressIndicator.show();
                        auth = new appContext.tokenAuthentication(serverInfo.authUrl, serviceCookie);
                        appContext.currentServiceConnection = new appContext.serviceConnection(serverInfo.ecmsUrl, auth, this.logOut);
                        // validate token and get user information
                        auth.validateToken().then(function () {
                            loggedIn = true;
                            appContext.currentServiceConnection.getCurrentUser().then(function (user) {
                                currentUser = user;
                                self.trigger('login');
                                spinningWheel.close();
                            });

                        }, function () {
                            resetLoginInformation();
                            spinningWheel.close();
                            self.trigger('logout');
                        });

                        // we always return true, because the validateLogin call is asynchronous
                        return true;
                    }
                    else {
                        return false;
                    }
                } catch (error) {
                    resetLoginInformation();
                    spinningWheel.close();
                    self.trigger('loginFailure', error);
                }

            },

            /**
             * Login callback, logs in user and gets user information.
             * @param userName users login name
             * @param password users password
             */
            logIn: function (userName, password) {

                // extract the tenant and username
                var credentials = userName.split('\\', 2);
                var self = this;
                
                var tempuser = "";
                var tenent = null;
                if (credentials.length == 1) {
                    tempuser = credentials[0];
                    auth = new appContext.credentialAuthentication(serverInfo.authUrl, tempuser, password, 'index');
                } else {
                    tempuser = credentials[1];
                    tenent = credentials[0];
                    auth = new appContext.credentialAuthentication(serverInfo.authUrl, tempuser, password, 'index', tenent);
                }

                try {
                    // login with credentials
                    auth = new appContext.credentialAuthentication(serverInfo.authUrl, tempuser, password, 'index', tenent);
                    appContext.currentServiceConnection = new appContext.serviceConnection(serverInfo.ecmsUrl, auth, this.logOut);
                    appContext.currentServiceConnection.login()
                        .then(function (token) {
                            loggedIn = true;
                            // get user info and fire login event
                            appContext.currentServiceConnection.getCurrentUser().then(function (user) {
                                    currentUser = user;
                                    appContext.localStorage.setData('token', token.serialize());
                                    appContext.localStorage.setData('isLoggedIn', loggedIn);
                                    self.trigger('login');
                                }, function (error) {
                                    resetLoginInformation();
                                    self.trigger('loginFailure', 'The username:password combination was not correct. error: ' + error.message);
                                }
                            );

                        }, function (error) {
                            resetLoginInformation();
                            self.trigger('loginFailure', 'Failed to get user information: ' + error.message);
                        });

                } catch (error) {
                    resetLoginInformation();
                    self.trigger('loginFailure', error.message);
                }

            },

            /**
             * logout callback, resets all login information.
             */
            logOut: function () {
                resetLoginInformation();
                this.trigger('logout');
            }
        });

        return LoginHandler;
    });