/**
 * Message handler provides possibilities to log and show messages with experience methods.
 */
define(['framework-core', 'framework-controls', 'logger'],
    function (Core, Controls, Logger) {
        'use strict';

        function MessageHandler() {

            /**
             * Logs for messages
             * @param message what have to be logged
             * @param logLevel
             */
            this.log = function (message, logLevel) {
                Logger.log(message, logLevel);
            };

            /**
             * Returns available log levels.
             */
            this.getLogLevels = function () {
                return Logger.levels;
            };

            /**
             * Shows an alert to the user.
             * @param message error message
             */
            this.showErrorAlert = function (message) {
                Controls.Dialog.show({
                    showCloseButton: false,
                    title: 'Title',
                    message: message,
                    buttons: 'ok',
                    type: 'error'
                });
            };

            /**
             * Shows a warning to the user.
             * @param message warning message
             */
            this.showWarningAlert = function (message) {
                Controls.Dialog.show({
                    showCloseButton: false,
                    title: 'Title',
                    message: message,
                    buttons: 'ok',
                    type: 'warning'
                });
            };

            /**
             * Shows an information to the user.
             * @param message info message
             */
            this.showInfoAlert = function (message) {
                Controls.Dialog.show({
                    showCloseButton: false,
                    title: 'Title',
                    message: message,
                    buttons: 'ok',
                    type: 'info'
                });
            };
        }

        return MessageHandler;
    });