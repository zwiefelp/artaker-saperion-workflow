Shell Changelog
===============

3.2.4
-----
* Fixed: "resource not found" dialog would show prematurely

3.2.3
-----
* Fixed: root route execution was ignored by the framework

3.2.2
-----
* Fixed: race condition where route validation occurred before all modules were loaded
* Fixed: loading an active session with no route resulted in a blank module area

3.2.1
-----
* Bug fix (TFS16680): user icon gets pushed off screen when imageset name is too long on mobile shell

3.2.0
-----
* Added settingsPages

3.1.0
------
* Added string resources for Chinese, Dutch, French, German, Portuguese, and Spanish.

3.0.0
-----
* Updated to Core 2.0
* Renamed to framework-shell
* Modifying exports to conform to new Core.TypeWrapper.wrap interface
* Removed shell.services and print element styles
* Shell.Header is now Shell.header
* Now depends on framework-home
* Much of the launcher functionality moved to framework-home
* Removed Shell.ModuleMenu.disable(true)
* Removed Shell.launcher
* Removed BlankModule

2.5.0
-----
* Added shown DOM event to quickAccessView

2.4.0
-----
* Added support for Module's keepInDOM flag (14090: fix iframe)
* Fix for small alignment bug caused by next release of controls

2.3.0
-----
* Fixed overlapping text issue in header (13677)
* Updated images and styles with new logo

2.2.3
-----
* Switched dependency from context to web-platform.  Should be removed altogether eventually

2.2.2
-----
* Added ability to set language back to browser default
* Fixed mobile up-button bug (11995)
* Added QuickAccess area
* Added QuickAccess item state api

2.2.1
-----
* Fixed multi-tab session management bug (12467)

2.2.0
-----
Added language selector

2.1.4
-----
* Removed min-height from #window to allow scrolling on phone and other small windows and devices

2.1.3
-----
* Removed username field auto focus on mobile

2.1.2
-----
* Increased version dependency for core
* Prompt to cancel actions that would result in the user not being able to complete operations that are currently in process. This is done by gathering responses from prompt:cancelmessage event subscribers.
* Fixed navbar bug in mobile

2.1.1
-----
* Fixed issue with Header export

2.1.0
-----
* Added globalSearch input
* Added support for printing HTML elements via Services.printElement() export

2.0.0
-----
* The ApplicationActions API has been removed.
* The mobileModuleActions API has been removed.
* Module menu dropdown may now be disabled via ModuleMenu.disable() export
* The various icon image properties are no longer supported and can be removed. A "className" property was added that accepts a CSS class to use for the icon.

```javascript
return Core.Module.extend({
    icon: {
        className: 'icon-FPO_square_filled',
        text: 'Sample Module'
    },
    ...
```

1.0.5
-----
* Added SSO support introduced by core 1.2.0
* Added logging for module switches

1.0.4
-----
* Added string resource shell.mainView.settings.about.header, which contains text removed from branding in application 1.0.3

1.0.3
-----
* Added branding support introduced by core 1.1.0
* Added warning to login screen when not using a secure connection.  Refer to [Confluence](https://confluence/display/HC/Disabling+SSL+Warnings) for more information.
* Fixed bug where username field on login screen was not being automatically focused.  This behavior does not occur when SSL warning is displayed due to screen reader concerns.

1.0.2
-----
* Fixed about page to display "iOS" as operating system when on iPhone and iPad
* Additonal fixes to bug fix in 1.0.1 relating to saving last username

1.0.1
-----
* Fixed bug where last used username was not automatically being populated into the username field on the login screen
* Fixed bug where username was not updated if session switched into anonymous mode
