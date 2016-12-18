/**
 * Resource handler provides localization of strings.
 */
define(['framework-core', 'json!static:resources/localizations'],
    function (Core, Localization) {
        'use strict';

        function ResourceHandler() {

            // Set default/fallback language
            Localization.root = Localization.en;
            // Use experience localization.
            var localization = Core.Strings.load(Localization);

            /**
             * String localization.
             * @param message
             */
            this.localize = function (message) {
                return localization.get(message);
            };
        }

        return ResourceHandler;
    });