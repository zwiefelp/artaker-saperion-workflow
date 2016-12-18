/**
 * LocalStorage provides storing and retrieving capabilities to the session storage.
 */
define([], function () {
    'use strict';

    return {
        /**
         * GetData gets data from session storage.
         *  @param key key where the value is stored
         */
        getData: function (key) {
            if (window.sessionStorage) {
                return window.sessionStorage.getItem(key);
            }
            else {
                return '';
            }
        },

        /**
         * SetData sets data to session storage.
         *  @param key key where the value should be stored
         *  @param value what should be stored
         */
        setData: function (key, value) {
            if (window.sessionStorage) {
                window.sessionStorage.setItem(key, value);
                return true;
            }
            else {
                return false;
            }
        }
    };
});