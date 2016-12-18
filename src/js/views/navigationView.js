/**
 * Navigation view is responsible to load all the inboxes.
 */
define(['framework-core', 'framework-controls', 'template!content/navigationView.html'],
    function (Core, Controls, NavigationTemplate) {
        'use strict';

        return Core.View.extend({

            /**
             * Event listener for viewer events.
             */
            domEvents: {},

            /**
             * Set initial values to the variables.
             * @param AppContext globally used app context.
             */
            initialize: function (AppContext) {
                this.appContext = AppContext;
                this.workflowManager = this.appContext.getWorkflowManager();
                this.navigation = {};
                this.location = Core.Location;
                this.selectionInfo = {};
            },

            /**
             * Clean and set up view with selectionInfo
             */
            render: function (selectionInfo) {
                // reset the view
                this.$element.empty();
                this.selectionInfo = selectionInfo;
                var self = this;

                // render the template
                NavigationTemplate.renderToView(this, this);

                // get all inboxes
                this.workflowManager.getInboxes().then(
                    function (inboxResult) {

                        var selectedItem = {};
                        var items = [];

                        // create navigation items
                        inboxResult.data.forEach(function (inbox) {
                            var item = {};
                            item.inbox = inbox;
                            item.name = inbox.name;
                            item.iconClass = 'icon-folder';
                            item.type = 'Inbox';
                            item.indicatorContent = inbox.totalCount;

                            items.push(item);
                        });

                        // create navigation control and attach the items
                        self.navigation = new Controls.Navigation(items, {
                            dataOrganizers: [new Controls.GroupHandler({property: 'sourceItem.type'})],
                            showIcons: true,
                            showIndicators: true
                        });

                        // add event listener
                        self.listenTo(self.navigation, 'change:selection', self.onNavigationSelectionChanged);

                        // put the navigation in the view
                        self.$element.html(self.navigation.getElement());

                        // check if we have a preselected item
                        if (typeof self.selectionInfo.inboxItem != 'undefined') {
                            items = self.navigation.getItems();
                            selectedItem = _.find(items, function (item) {
                                return item.sourceItem.inbox.id === self.selectionInfo.inboxItem;
                            }, this);
                        }

                        if (typeof selectedItem != 'undefined') {
                            self.navigation.selectItem(selectedItem);
                        }
                        else {
                            self.navigation.selectItem(items[0]);
                        }

                    },
                    function (error) {
                        self.appContext.log('Could not get the inboxes because of: ' + error.message, self.appContext.getLogLevels().ERROR, true);
                    }
                );
            },

            /**
             * Gets the selected navigation item
             * (First selected navigation item on multiple selection)
             */
            getSelectedItem: function () {
                var items = this.navigation.getSelectedItems();
                // check for existence of items
                if (items && items.length) {
                    return items[0].sourceItem;
                }
            },

            /**
             * Sets the selection item in navigation
             */
            setSelectedItem: function (item) {
                this.navigation.selectItem(item);
            },

            // send selected item to main view for dispatching
            onNavigationSelectionChanged: function () {
                var selectedItem = this.getSelectedItem();
                if (typeof selectedItem != 'undefined') {
                    this.selectionInfo.inboxItem = selectedItem.inbox.id;
                    selectedItem.selectionInfo = this.selectionInfo;
                    this.location.navigate(this.appContext.path + '/inboxes/' + selectedItem.inbox.id, {trigger: false});
                    this.trigger('change:selection', selectedItem);
                }
            }
        });
    });