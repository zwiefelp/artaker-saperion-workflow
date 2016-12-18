/**
 * App context provides global functions as a single instance.
 * It is the connection to the ecm sdk and most of the utility modules.
 * Also experience functionalities are exposed.
 */
define(['util/localStorage', 'json!static:config/productinfo'],
    function (LocalStorage, Config) {

        'use strict';

        /**
         * Appcontext should always be a singleton.
         */
        var Singleton = (function () {
            var instance;

            // this is our real object, all functions and variables that are defined in that object are accessible later on
            function AppContext(Callbacks) {
                this.features = Config.features;
                this.version = Config.productVersion;
                this.availableServers = Config.availableServers;
                this.archiveConfig = Config.archiveConfig;
                this.currentServiceConnection = {};
                if (typeof window.saperionSdk != 'undefined') {
                    this.tokenAuthentication = window.saperionSdk.TokenAuthentication;
                    this.serviceConnection = window.saperionSdk.ServiceConnection;
                    this.credentialAuthentication = window.saperionSdk.CredentialAuthentication;
                }
                this.localStorage = LocalStorage;
                this.callbacks = Callbacks;

                /**
                 * Localization for strings/messages.
                 * @param resourceString string that has to be translated
                 */
                this.localize = function (resourceString) {
                    return this.callbacks.localize(resourceString);
                };

                /**
                 * Information about the available log levels.
                 */
                this.getLogLevels = function () {
                    return this.callbacks.getLogLevels();
                };

                /**
                 * Constructor initializes app context and reads session information.
                 * @param message message that has to be logged
                 * @param logLevel see getLogLevels for different log kinds
                 * @param showMessageToUser should the message be visible for the user (alert window)
                 */
                this.log = function (message, logLevel, showMessageToUser) {
                    this.callbacks.log(message, logLevel);
                    if (showMessageToUser) {
                        switch (logLevel) {
                            case 'error':
                                this.callbacks.showErrorAlert(message);
                                break;
                            case 'warning':
                                this.callbacks.showWarningAlert(message);
                                break;
                            case 'info':
                                this.callbacks.showInfoAlert(message);
                                break;
                            default:
                                break;
                        }
                    }
                };

                /**
                 * Setup for workflow manager.
                 */
                this.getWorkflowManager = function () {
                    return new window.saperionSdk.WorkflowManager(this.currentServiceConnection);
                };

                /**
                 * Checks if the callbacks are valid.
                 * If not, set default callbacks.
                 */
                this.checkCallbacks = function () {
                    if (!this.callbacks.hasOwnProperty('log')) {
                        this.callbacks.log = function (message) {
                            console.log(message);
                        };
                    }
                    if (!this.callbacks.hasOwnProperty('getLogLevels')) {
                        this.callbacks.getLogLevels = function () {
                            return {CRITICAL: 5, ERROR: 4, WARNING: 3, INFO: 2, VERBOSE: 1, NONE: 0};
                        };
                    }
                    if (!this.callbacks.hasOwnProperty('showErrorAlert')) {
                        this.callbacks.showErrorAlert = function (message) {
                            alert('Error: ' + message);
                        };
                    }
                    if (!this.callbacks.hasOwnProperty('showWarningAlert')) {
                        this.callbacks.showWarningAlert = function (message) {
                            alert('Warning: ' + message);
                        };
                    }
                    if (!this.callbacks.hasOwnProperty('showInfoAlert')) {
                        this.callbacks.showInfoAlert = function (message) {
                            alert('Info: ' + message);
                        };
                    }
                    if (!this.callbacks.hasOwnProperty('localize')) {
                        return this.callbacks.localize = function () {
                            return 'no localization';
                        };
                    }
                };

                /**
                 * Check for valid app context.
                 */
                this.isValid = function () {
                    return this.hasOwnProperty('version');
                };

                /**
                 * Reads the server information from productInfo.json.
                 */
                this.getCurrentServerInfo = function () {
                    if (this.availableServers.length === 1) {
                        return this.availableServers[0];
                    }
                    else {
                        var preferredServer = {};
                        this.availableServers.forEach(function (server) {
                            if (server.id === Config.currentServer) {
                                preferredServer = server;
                            }
                        });
                        return preferredServer
                    }
                };

                this.getArchiveConfig = function () {
                    return this.archiveConfig
                }

                /**
                 * Localization (i18n) in templates.
                 */
                this.renderToView = function (view, Template, data, options) {
                    var self = this;
                    options = options || {};
                    options.helpers = _.extend({
                        i18n: function (key, options) {
                            return self.localize(key, options.hash); // TODO: check it if options is necessary
                        }
                    }, options && options.helpers);

                    Template.renderToView(view, data, options);
                };
            }

            /**
             * Create the app context if all dependencies could be loaded.
             */
            function createInstance(Callbacks) {
                var appContext = new AppContext(Callbacks);
                appContext.checkCallbacks();
                if (!appContext.isValid()) {
                    appContext = undefined;
                }
                return appContext;
            }

            return {
                /**
                 * This is the only public function in that module.
                 * One single instance is created and used for all modules.
                 */
                getInstance: function (Callbacks) {
                    if (!instance) {
                        instance = createInstance(Callbacks);
                    }
                    return instance;
                }
            };
        })();

        return Singleton;

    });