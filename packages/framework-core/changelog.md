Core Changelog
==============

2.1.6
------
* Fixed: session begin event not firing for modules loaded after session becomes active

2.1.1
------
* Fixed issue where module.path values were prepended with a hash

2.1.0
------
* Added string-level translation fallback
* Added string resources for Chinese, Dutch, French, German, Portuguese, and Spanish.

2.0.0
------
* Renamed to framework-core
* Changed to be of the form wrap(ThingToWrap, prototype members and events, direct members and events)
* Updated packageCatalog to keep from executing functions as callbacks when it does define(manifest.name, entryPointExports);
* LogSystem.canLaunchViewer and LogSystem.launchViewer have been removed and are no longer available.
* The "hosted" property from platform detector is no longer available
* The "moduleVisibilityChanged" event has been removed
* Updated Globalize, added currency and relative times support, changed string resource loading and accessing.
* Removed IntegrationServer types
* Removed Core.Printer
* Moved logViewer.html from application to core
* Moved sso folder from application to core
* Moved runtime and package loading code to framework-runtime
* Modules can be plain functions, they don't have to extend Core.Module (if they don't need routes or to be in the app list)
* String resource loaded has been re-done
* CSS and Less loading now uses css! and less! plugins. This functionality has moved to framework-require-plugins
* Handlebars helpers have been removed. Specify them yourself in your render call options.
* Core.PlatformDetector now requires new
* platform! plugin has been removed
* View's now have access to $element in initialize
  * Removed onBeforeRemove call. Wrap the `remove` method instead
  * Removed close, use remove instead
  * View no longer sets this.options, do this manually in initialize
* Integration server types and functionality is now in lesrdl-content-integrationserver
* Connections are now called ClientSession's
* Most config settings moved to a framework-runtime sub-section in config.json
* No longer default to integration server if a connection/client session is not configured
* SsoConnection renamed to SsoClientSession
* Lodash upgraded to v4
* If you use lodash or jquery, you have to specify it in your bower.json
* Instead of asking for underscore, ask for lodash instead
* package.json is no longer used/loaded by the runtime. A bower.json must be configured in config.json devPackages at dev time.
  A metadata.json is now loaded from the built package at production time.
* We no longer recommend that you return `this` from render methods
* Removed the moduleVisibilityChanged event
* You can now export a function from your package. If you exported a function before, the function will be exported instead of its result.
* Branding moved to framework-brand
* Core.Location.routeFilters replaces someConnection.filterRoute
* Removed Core.Module.connected
* Added a window.fetch polyfill
* Core.App is removed
* Core.EventAggregator is removed
* Backbone upgraded to v1.2.4
* The web-platform package is no longer used

1.13.1
------
* Fixed a bug in platform detector that was sometimes causing desktop view to show on iOS.

1.13.0
------
* Added Object.freeze polyfill (sort of)
* Added Events.listenToOnce

1.12.0
------
* Added ES6 Promise polyfill

1.11.0
------
* Added default value support in handlebars date helper

1.10.1
------
* Fixed: module.location gets replaced during initialize call

1.10.0
------
* Added support for module loadPriority

1.9.0
-----
* Added handling for Shell:BlankModule

1.8.1
-----
* Fix to allow Location.getFragment before routing starts

1.8.0
-----
* Made upButtonAction fire an event on module
* Added ability to set language back to browser default
* Added date formatter handlebars helper
* Added Location.getFragment
* Fixed for SSO deep linking

1.7.3
-----
* Fixed className/classList sync issue in Polyfills

1.7.2
-----
* Fixed bug in TypeWrapper when a member of it returns a type

1.7.1
-----
* Added plumbing to allow locale setting

1.7.0
-----
* Made xhr abort logging configurable

1.6.0
-----
* Added pre-disconnect and pre-unload events
* Fixed Model initialization problem

1.5.1
-----
* Added option to ignore xhr aborts

1.5.0
-----
* Added Printer API
* Fixed anonymous login / deep link bug
* Fixed some web and mobile bugs
* Added module deactivate event
* Added module activate event
* Added ability to prompt user on disconnect or navigation/reload

1.3.1
-----
* Added original object to TypeWrapped object during unit testings to allow for APIs to be tested
* Added API to find out if shell header should be hidden
* Added ability to TypeWrap properties
* Changed IntegrationServerConnection to allow for filter route functionality in behaviors

1.3.0
-----
* Added support for subsequent package loading
* Added ability to access members hidden via TypeWrapper during unit testing


1.2.7
-----
* Fixed an SSO bug where non-json data was not being properly detected

1.2.6
-----
* Fixed an SSO issue caused by caching the sso-redirect page

1.2.5
-----
* Fixed an SSO issue with IE9

1.2.4
-----
* Fixed an issue when using models to load images and the model returns an error

1.2.3
-----
* Core now handles a 401 on Integration Server login when configured for SSO

1.2.2
-----
* Fixed issue where user was not logged out of Integration Server when switching to anonymous user

1.2.1
-----
* Various SSO changes

1.2.0
-----
* Added SSO support

1.1.3
-----
* (Bug 11245) Fixed login failure page refresh issue
* (Bug 9628)  Anonymous login now correctly replaces existing IS sessions

1.1.2
-----
* Fixed 401 handling for mobile platform

1.1.0
-----
* Added branding support of product name.  Refer to [Confluence][https://confluence/display/HC/Branding+in+PCF] for more information.

1.0.2
-----
* Minor localization fixes
* Fixed bug where application error page would not be able to correctly display several error messages

1.0.1
-----
* Fixed bug where username was not updated if session switched into anonymous mode
