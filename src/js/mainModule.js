define(['framework-core', 'framework-controls', 'framework-home', 'logger', 'views/mainView', 'util/appContext', 'util/messageHandler', 'util/resourceHandler'],
    function (Core, Controls, Home, Logger, MainView, AppContext, MessageHandler, ResourceHandler) {

        'use strict';

        /**
         * Main module - connection to the runtime.
         */
        var MainModule = Core.Module.extend({

            /**
             * Home URL of the module.
             */
            path: 'artaker-saperion-workflow',

            /**
             * Icon for the module in the home screen.
             */
            icon: 'icon-FPO_square',

            /**
             * Title shown in the home screen.
             */
            title: 'Saperion Workflow Inbox',

            /**
             * Routes for the module.
             */
            routes: {
                '': 'selectItem',
                'inboxes/:inboxItem': 'selectItem',
                'inboxes/:inboxItem/wfitem/:wfItem': 'selectItem',
                'inboxes/:inboxItem/wfitem/:wfItem/document/:documentItem': 'selectItem'

            },

            /**
             * Initialization of the module, creates the app context instance and sets callbacks.
             */
            initialize: function () {
                //Initialize AppContext

                var messageHandler = new MessageHandler();
                var resourceHandler = new ResourceHandler();

                this.appContextCallbacks = {
                    "log": messageHandler.log,
                    "getLogLevels": messageHandler.getLogLevels,
                    "localize": resourceHandler.localize,
                    "showErrorAlert": messageHandler.showErrorAlert,
                    "showWarningAlert": messageHandler.showWarningAlert,
                    "showInfoAlert": messageHandler.showInfoAlert
                };

                //Initialize AppContext
                this.appContext = AppContext.getInstance(this.appContextCallbacks);
                this.appContext.path = this.path;
                this.appContext.log('currently running with version: ' + this.appContext.version, this.appContext.getLogLevels().INFO);

                // Add module to the home screen
                Home.apps.add(this);
            },

            /**
             * Routing method for navigation.
             */
            selectItem: function (inboxItem, wfItem, documentItem) {
                // collect routing information and forward it to the main view
                var selectionInfo = {inboxItem: inboxItem, wfitem: wfItem, documentItem: documentItem};
                if (!this.mainView) {
                    this.mainView = new MainView(this.appContext);
                }
                this.mainView.render(selectionInfo);
                this.$element.html(this.mainView.$element);
            }
        });

        return MainModule;
    });
