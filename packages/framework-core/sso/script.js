(function() {
    'use strict';

    function exec(regex, value) {
        return regex.exec(value) || [];
    }

    function getRedirectUrl(location, cookie) {
        var ssoToken = exec(/ssotoken=(\d{8})/, location.href)[1];
        var cookieRedirectMatch = exec(/framework-core\.ssoredirect=(\d{8})(.*?)($|;)/, cookie);
        var redirectPath = cookieRedirectMatch[1] === ssoToken && cookieRedirectMatch[2];
        return typeof redirectPath === 'string' ? location.origin + decodeURIComponent(redirectPath) : null; //Allow redirectPath === ''
    }

    function performRedirect(options) {
        options = options || {};
        var location = options.location || window.location;
        var document = options.document || window.document;

        var redirectUrl = getRedirectUrl(location, document.cookie);
        document.cookie = 'framework-core.ssoredirect=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC';

        if(redirectUrl) location.href = redirectUrl;
        else throw 'SSO_ERROR';
    }

    function processSso(options) {
        options = options || {};
        //if(typeof options.document === 'string') { debugger }
        try {
            performRedirect(options); 
        } catch(e) {
            if(e === 'SSO_ERROR') (options.document||document).body.innerHTML = '<h1>SSO Error</h1>';
            else throw e;
        }
    }

    function install(options) {
        options = options || {};
        if (!options.execute && typeof define === 'function' && define.amd) { 
            define({
               install: install,
               processSso: processSso
            });
        }
        else { 
            processSso(options); 
        }
    }

    install();
})();
