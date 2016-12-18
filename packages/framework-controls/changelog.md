## 3.7.4
* Bug Fix: fitAllColumns method of Grid will now work without causing column headers overflow state.

## 3.7.3
* Bug Fix: Progress indicators on Safari were sometimes not centered because of un-prefixed CSS transform

## 3.7.2
* Bug Fix: (TFS16677) Fixed an issue where iOS devices do not close modal dialogs on background click because mouse events are not triggered when a click is on a non-clickable element.
* Bug Fix: Fixed an issue where close icons (indicated with an x) inside dialogs would not close when tapped.

##3.7.1
* Bug Fix: Fixed an issue where framework events wouldn't propagate correctly on draggable elements and intendended behavior wouldn't occur, e.g. grid headers wouldn't sort when touched.

##3.7.0
* Feature: Toggle Switches can reflect indeterminate state of its hidden checkbox by adding the .toggle--indeterminate class.

##3.6.5
* This fixes an issue where alert content was not growing when taking the full-width of the alert container.

##3.6.4
* Improved Grid checkbox/text alignment

##3.6.3
* Bug fix: Resolved issue causing Grid items in 'grid' presentation to be displayed in an incorrect order when sorted

##3.6.2
* Bug fix: Updated styles for flat and hierarchical tree styles

##3.6.1
* Bug fix: Showing the keyboard on android causes a bad layout.

##3.6.0
* Added ItemDrop and FileUpload controls

##3.5.2
* Bug fix: Showing the keyboard on iOS < 9 causes a bad layout.

##3.5.1
* Bug Fix: Tree Control - Blank Folder on Mobile #91
* Simplify TransitionalContentContainer forward and backward transitions

##3.5.0
* Add minimal style option to tabs
* Bug fix: closing a tab would prepend the furthest left tab's content to the other tab's content

##3.4.3
* Improve mobile resizer grips
* Fixed: dragDrop cancels legitimate touch events (TFS16650)

##3.4.2
* Bug fix: tab content out of sync with tab strip

##3.4.0
* Bug fix: touch events stop working after calling setResizable

##3.3.0
* Added additional icons

##3.2.0
* Updated the icon font
* Bug fix: fitAllColumns doesn't work if called before the grid is finished rendering and the columns are rendered after the rows
* Bug fix: tooltips and popovers throw and exception when a source isn't specified

##3.1.2
* Bug fix: hierarchical renderer isn't placing items correctly on collection insert
* Bug fix: when multiple dialogs are open, the most recent one is on bottom instead of top

##3.1.1
* Bug fix: toolbar.setContent only accepts jQuery compatible objects

##3.1.0
* Modifying properties styles and best practices for accessibility

##3.0.0
* Renamed to framework-controls
* Now using framework-core 2.0
* Exposed internal logic as input, state, rendering, and layout components
* Adopted BEM syntax for CSS
* Added support for Backbone Views and Handlebars templates as content
* Added the autocomplete control
* Added basic cards styles and the card organizer
* Added an Options object for merging properties between presentation types
* Added support for configuring panes through HTML
* Added support for drop targets during drag operations
* Combined the alert dialog and model dialogs
* Remove the AccordionPanel, AlertContainer, and mobile Grid.

##2.34.0
* Updated the icon font
* Bug fix: item panels weren't scroll to items correctly during keyboard navigation

##2.33.0
* Updated the icon font
* Bug fix: hierarchical collection weren't handling the addition of multiple items correctly

##2.32.2
* Adding cursor: pointer styles to help with iOS click events

##2.32.0
* Added the wizard control
* Bug fix: drag\drop touchcancel wasn't properly setting pointer data
* Updated the icon font

##2.31.0
* Adding functionality to the grid to help maintain scroll position as the collection changes

##2.30.0
* Updated the icon font

##2.29.0
* Updated the icon font

##2.28.0
* Updated the icon font

##2.27.4
* Bug fix: Alternate grid views don't deselect removed items

##2.27.3
* Bug fix: Iframe fix element doesn't resize as an iframe is being resized

##2.27.2
* Bug fix: Iframe aren't properly covered during a drag operation

##2.27.1
* Bug fix: Disabled buttons aren't styled properly on the main-toolbar

##2.27.0
* Added the sizeToSourceElement positioning option
* Bug fix: Virtualization spacers are being added in the wrong position in the list view of the grid

##2.26.4
* Bug fix: The last element removed from a collection view isn't deselected

##2.26.3
* Bug fix: Elements removed from a collection view aren't removed from the selected items array

##2.26.2
* Bug fix: Popover close events don't always have the sourceEvent

##2.26.0
* Exposing render events from the pane container

##2.25.2
* Bug fix: Source events aren't passed through contextmenu:item events

##2.25.1
* Bug fix: Canvas scrolls parent on click
* Bug fix: Navigation throws an exception on expand if the items haven't been rendered
* Bug fix: Drag operations continue if the mouse is released outside the browser window

##2.25.0
* Added styles for a toggle switch

##2.24.0
* Added support for icons in floating alerts

##2.23.0
* Updated the icon font

##2.22.0
* Added styles for floating alerts
* Bug fix: Popovers aren't honoring left\top positions set during show events
* Bug fix: Select dropdown arrow is overlapping text

##2.21.6
* Bug fix: Dialog buttons are undefined after construction until the 'show' event

##2.21.5
* Bug fix: Headerless modal dialogs don't honor the showCloseButton option
* Bug fix: Key events in input elements are being consumed by the input handler

##2.21.4
* Bug fix: Select elements clip the bottom of text
* Bug fix: Alternate grid views don't handle remove:item correctly

##2.21.3
* Bug fix: Popups are remaining open after their source elements are removed.

##2.21.2
* Bug fix: Touchstart handler in expander is not longer necessary and is preventing selection in expandable grid-list rows.

##2.21.0
* Updated the icon font
* Switched the base web font to .woff file types

##2.20.1
* Disabled use of the Web Animations API in the Animator

##2.20.0
* Updated the icon font

##2.19.0
* Exposing classes for a stylized main toolbar
* Adding a class to drag visuals to avoid class name conflicts

##2.18.2
* Bug fix: Alert dialog isn't displaying strings that contain text and a single embedded html element.
* Bug fix: Animation is getting stuck in an infinite loop in iOS progress indicator

##2.18.1
* Bug fix: Modal dialog close button is lacking the proper aria markup

##2.18.0
* Added a 'closed' event to the popover API
* Switched font to TP Hero
* Updated the icon font
* Bug fix: Popover close button is lacking the proper aria markup

##2.17.0
* Added orientation logic to the Resizer for manipulating elements under transforms
* Added the ability manually trigger the mobile version of the Navigation control

##2.16.0
* Updated the icon font
* Bug fix: Firefox (and presumably other smooth-scroll implementations) scroll very slowly in the grid, list, and tree

##2.15.0
* Adjusted styles for several controls for Tablet display
* Exposed internal positioning logic through Controls.Utility
* Exposed a more flexible transition method through the TransitionalContentContainer
* Bug fix: Alternate grid views don't expose contextmenu:row
* Bug fix: Disabled buttons when a progress indicator is over them
* Bug fix: Popup positioning doesn't work with transformed source elements
* Bug fix: Popups are getting orphaned if the source element is removed during the show delay
* Bug fix: Progress Indicator overrides the disabled state of buttons
* Bug fix: Select elements on Firefox 35 no longer show a dropdown arrow

##2.14.0
* Added empty state template options to the grid, list, and tree
* Added handling for toggle buttons and button groups

##2.13.0
* Upgrading internal animation and exporting the Animator
* Bug fix: Action dialog doesn't scroll

##2.12.2
* Bug fix: Expanders don't transition correctly on iOS
* Bug fix: Text areas use the incorrect font

##2.12.1
* Bug fix: Drag\drop isn't positioning objects correctly inside scrollable regions

##2.12.0
* Bug fix: Mobile styles were causing bugs in the tree control on Tablet
* Updated the icon font

##2.11.0
* Added the action pane API to the pane container
* Added the Action Sheet control
* Updated the icon font

##2.10.0
* Added events to the collection views
* Added detachContent and isPositioned options to popovers
* Bug fix: Expandable headers don't work on devices that have both touch and peripheral input
* Bug fix: Mobile touch button handling is interfering with group\toggle button `selected` state

##2.9.1
* Bug fix: Grid column header weren't scrolling horizontally

##2.9.0
* Added grid column resize and reorder events
* Added the ability to set a custom sort or filter handler on collection views
* Added the ability to disable, cancel, or customize a sort on a grid column
* Added events for progressive loading to the grid, list, and tree
* Updated the icon font

##2.8.0
* Added styles for properties
* Added a markup API for expandable headers
* Added styles for some of the HTML5 input controls

##2.7.0
* Added the navigation control
* Bug fix: Fade out and remove animations weren't removing elements that were display: none

##2.6.2
* Bug fix: Tab headers don't correctly auto-tooltip when content is truncated

##2.6.1
* Bug fix: Grid column header icons weren't aligning correctly

##2.6.0
* Added the transitional content container
* Updated the icon font

##2.5.0
* Exposed item render and visibility events for the grid, list, and tree
* Bug fix: The tree control wasn't properly updating the selected items list when using checkbox selection

##2.4.0
* Added checkboxes to the tree control

##2.3.0
* Added alternate grid views
* Added layout grid column styles
* Updated the icon font
* Bug fix: Tab item content was getting orphaned when the item was removed from the collection

##2.2.0
* Added badges
* Updated the icon font
* Bug fix: Action dialogs weren't canceling on tap on iOS

##2.1.1
* Bug fix: Style conflict for alerts inside modal dialogs
* Bug fix: Modal dialogs were throwing an exception when showCloseButton was set to false

##2.1.0
* Implemented a more robust virtualization mechanism
* Updated the icon font

##2.0.2
* Bug fix: Drag handling was interfering with inputs on dialogs
* Bug fix: Menu items that were selected during initialization weren't receiving focus

##2.0.1
* Bug fix: Source items were being returned from the grid element creation callback methods instead of view items
* Bug fix: Modal dialogs weren't capturing focus on tab

##2.0.0
* Rebranded the control suite for more minimalistic design
* Allowing for arbitrary content in data controls (grid, list, tree)
* Added configurable property binding to objects in collection views
* Switched the tab control to use collection views
* Added the action dialog
* Added the shade control
* Added the popover menu
* Removed the basement
* Bug fixes

##1.0.0
* Upgraded to Core 1.0.0
* Bug fixes

##0.6.0
* Upgraded dependency support for Core 0.7.0 and jQuery 2.1.0
* Adding pressed states in for buttons during touch events

##0.5.0
* Removed the old toolbar styles
* Prevented control initialization with selector strings. HTML\jQuery elements are now required.

##0.4.0
* Collapsible control groups in the toolbar control
* Added the progress indicator control

##0.3.0
* Standardized all event names and signatures
* Implemented collection views in the Grid, List, and Tree
* Added sort and filter handlers
* Added surface\screen space translation to the canvas control
* Scattered changes to help overall API consistency

##0.2.0
* Added the basement
* Added popovers

##Versioned the initial controls suite
* Alerts
* Alert dialog
* Canvas control
* Grid
* List
* Menu
* Modal dialog
* Panes
* Toolbar control
* Tooltips
* Tree
