/**
 * Content view is responsible to load the workflow Tasks for the selected inbox
 */
define(['framework-core', 'framework-controls', 'template!content/contentView.html', 'template!content/cardView.html', 'template!content/listView.html'],
    function (Core, Controls, ContentTemplate, CardTemplate, ListTemplate) {
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
                this.location = Core.Location;
                this.inboxItem = {};
                this.inbox = {};
                this.grid = {};
                this.selectionInfo = {};
                this.currentPresentationType = 'list';
                this.progressIndicator = {};
            },

            /**
             * Clean and set up view with InboxItem.
             */
            render: function () {
                var self = this;

                // reset the view
                this.$element.empty();
                this.appContext.renderToView(this, ContentTemplate, this);
                // Defining Grid properties
                var columns = [
                    {
                        width: 110,
                        name: this.appContext.localize('content.invoiceDate'),
                        propertyName: 'invoiceDate'
                    },
                    {
                        width: 150,
                        name: this.appContext.localize('content.vendorName'),
                        propertyName: 'vendorName'
                    },
                    {
                        width: 130, name: this.appContext.localize('content.amount'), propertyName: 'amount'
                    },
                    {
                        width: 150,
                        name: this.appContext.localize('content.invoiceNumber'),
                        propertyName: 'invoiceNumber'
                    },
                    {
                        width: 110, name: this.appContext.localize('content.dueDate'), propertyName: 'dueDate'
                    },
                    {
                        width: 150,
                        name: this.appContext.localize('content.assignedBy'),
                        propertyName: 'assignedBy'
                    }
                ];
                var options = {
                    maxVisibleItems: 1000,
                    components: ['progressiveLoading'],
                    loadItemsVisual: 'button',
                    presentationType: this.currentPresentationType,
                    card: { content: CardTemplate, columnSizes: [400, 1200, 1800,Infinity] },
                    list: {content: ListTemplate},
                    selection: 'single'
                };

                // To have localization in card,list templates
                options.helpers = _.extend({
                    i18n: function (key, options) {
                        return self.appContext.localize(key, options.hash); // TODO: check it if options is necessary
                    }
                }, options && options.helpers);

                this.grid = new Controls.Grid([], options, columns, {});
                this.listenTo(this.grid, 'change:selection', this.onSelectionChanged);
                this.$element.append(this.grid.getElement());

            },

            /**
             * Bind workflow items based on selected inbox.
             */
            loadWFItems: function (InboxItem) {
                var self = this;

                // Show Progress indicator while binding the data
                if (typeof InboxItem != 'undefined') {
                    var parent = document.getElementById('contentView');
                    this.progressIndicator = Controls.ProgressIndicator.show({
                        parent: parent,
                        isModal: false,
                        isIndeterminate: true
                    });

                    // Get the workflow tasks based on inboxItem
                    this.inboxItem = InboxItem;
                    this.inbox = InboxItem.inbox;
                    this.selectionInfo = InboxItem.selectionInfo;
                    this.inbox.getWorkflowTasks(1, true).then(
                        function (taskResult) {
                            var workflowTasks = taskResult.data;
                            if (taskResult.data.length > 0) {

                                // Resetting the grid view items
                                self.grid.collectionView.items.length = 0;

                                // Adding each item to array and binding it to Gridview
                                workflowTasks.forEach(function (task) {
                                    //var duedate = new Date(task.userFields.USERDEFINED2.propertyValue);
                                    var duedate = new Date(2016,11,18)
                                    var item = {
                                        invoiceDate: task.receiveDate.toLocaleDateString('de-DE', {
                                        //invoiceDate: duedate.toLocaleDateString('de-DE', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }),
                                        dueDate: duedate.toLocaleDateString('de-DE', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }),
                                        vendorName: task.subject,
                                        assignedBy: task.actor.name,
                                        amount: task.userFields.USERDEFINED1.propertyValue + " EUR",
                                        invoiceNumber: task.userFields.USERDEFINED3.propertyValue,
                                        isOverDue: duedate < Date.now(),
                                        lastOwner: task.previousActor.name
                                    };
                                    
                                    // Rendering data using document object of task
                                    // PZ: Changed to generic Archive Fields and Fields from ArchiveConfig from productinfo.json
                                    if (task.hasDocument) {
                                       
                                        var formatValue = function(value) {
                                            console.log(value)
                                            return value.propertyValue
                                        }

                                        task.document.refresh().then(
                                            function (doc) {
                                                item.archive = doc.archive.name                
                                                item.fieldname = []
                                                var archiveConfig = self.appContext.getArchiveConfig()

                                                if (archiveConfig.hasOwnProperty(item.archive)) {
                                                    // Append only Fields from productinfo.json for specific Archive
                                                    var archiveFields = archiveConfig[item.archive]
                                                    console.log("Found Archive " + item.archive + " in Config. NumFields: " + archiveFields.length)

                                                    if ( archiveFields.length >= 0 ) {                                                        
                                                        archiveFields.forEach( function (field) {
                                                            if (doc.indexData.hasOwnProperty(field.fieldname)) {
                                                                item.fieldname.push({
                                                                    'name': field.dispname, 
                                                                    'value': formatValue(doc.indexData[field.fieldname])
                                                                })                                                      
                                                            }
                                                        })
                                                    }
                                                } else {                                                        
                                                    // Append all indexData of Dokument to DokumentIndex
                                                    console.log("Not Found Archive " + item.archive + " in Config. Using generic Fields")
                                                    for (var key in doc.indexData) {
                                                        item.fieldname.push({
                                                            'name': key,
                                                            'value': formatValue(doc.indexData[key])
                                                        })         
                                                    }
                                                }
                                                        
/*
                                                if (doc.indexData.hasOwnProperty('invoicereceivedate')) {
                                                    item.startDate = new Date(doc.indexData['invoicereceivedate'].propertyValue).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    });
                                                }
                                                */

                                            },
                                            function (error) {
                                                self.appContext.log('getDocument failed because of', error);
                                            });
                                    }

                                    // Rendering the Transitions for each task
                                    task.getTransitions().then(
                                        function (transitions) {
                                            console.log(transitions.data)
                                            item.transitions = transitions.data;
                                        }, function (error) {
                                            self.appContext.log('error getting transitions');
                                        });

                                    item.task = task;
                                    self.grid.collectionView.addItem(item);
                                    self.grid.update();

                                })
                            }
                            else {
                                // Resetting the grid view items when no items are present
                                self.grid.collectionView.items.length = 0;
                                self.grid.update();
                            }

                            // check if we have a preselected item
                            if (typeof self.selectionInfo.wfitem !== 'undefined' && self.selectionInfo.wfitem !== null) {
                                var items = self.grid.getItems();
                                var selectedItem = _.find(items, function (item) {
                                    return item.sourceItem.task.id === self.selectionInfo.wfitem;
                                }, this);
                            }

                            if (typeof selectedItem != 'undefined') {
                                self.grid.selectItem(selectedItem);
                            }

                            self.grid.sortByColumn(self.grid.getColumns()[0], false);
                            self.progressIndicator.close();
                        },
                        function (error) {
                            self.progressIndicator.close();
                            handleError('get workflow tasks failed because of', error);
                        });
                }
            },

            /**
             * Applies the trasition (Approve/Reject) on selected worflow task
             * @param event identifier which button was pressed
             */
            onApplyTransition: function (event) {
                var self = this;
                var selectedItem = this.getSelectedItem();
                selectedItem.transitions.forEach(function (transition) {
                    if (transition.description === event.currentTarget.id) {
                        transition.apply('').then(function () {
                            self.selectionInfo.wfitem = {};
                            self.trigger('update:selection', self.selectionInfo);
                        }, function (error) {
                            self.appContext.log(error);
                        });
                    }
                });
            },

            /**
             * Applies the Action (moveToMyInbox/moveToPreviousInbox)
             * @param event identifier which button was pressed
             */
            onApplyMove: function (event) {
                var self = this;
                var selectedItem = this.getSelectedItem();
                switch (event.currentTarget.id) {
                    case 'moveToMyInbox':
                        if (selectedItem.task.canMoveToMyInbox) {
                            selectedItem.task.moveToMyInbox().then(function () {
                                self.selectionInfo.wfitem = {};
                                self.trigger('update:selection', self.selectionInfo);
                            }, function (error) {
                                self.appContext.log(error);
                            });
                        }
                        break;
                    case 'moveToPreviousInbox':
                        if (selectedItem.task.canMoveToPreviousInbox) {
                            selectedItem.task.moveToPreviousInbox().then(function () {
                                self.selectionInfo.wfitem = {};
                                self.trigger('update:selection', self.selectionInfo);
                            }, function (error) {
                                self.appContext.log(error);
                            });
                        }
                        break;
                    default:
                        break;
                }

            },

            /**
             * Gets all the selected items in grid
             * (usually when multiple selection enabled)
             */
            getSelectedItems: function () {
                return this.grid.getSelectedItems();
            },

            /**
             * Gets the selected item  in grid
             * ( First selected item on multiple selection)
             */
            getSelectedItem: function () {
                var items = this.grid.getSelectedItems();
                // check for existence of items
                if (items && items.length) {
                    return items[0].sourceItem;
                }
            },

            /**
             * Sets the selection item in grid
             */
            setSelectedItem: function (item) {
                this.grid.selectItem(item);
            },

            /**
             * Sets the presentation Style for grid
             */
            setStyle: function (style) {
                this.currentPresentationType = style;
                this.grid.setOptions({
                    presentationType: style
                });
            },

            // send selected item to main view for dispatching
            onSelectionChanged: function () {
                var self = this;
                var selectedItem = this.getSelectedItem();
                if (typeof selectedItem !== 'undefined') {
                    var items = this.grid.getSelectedItems();
                    items.forEach(function (item) {
                        self.grid.collectionView.invalidateItem(item);
                    });
                    this.selectionInfo.wfitem = selectedItem.task.id;
                    selectedItem.selectionInfo = this.selectionInfo;
                    this.location.navigate(this.appContext.path + '/inboxes/' + this.selectionInfo.inboxItem + '/wfitem/' + selectedItem.task.id, {trigger: false});
                    this.trigger('change:selection', selectedItem);
                }
                else {
                    this.selectionInfo.wfitem = null;
                    selectedItem = {};
                    selectedItem.selectionInfo = this.selectionInfo;
                    this.location.navigate(this.appContext.path + '/inboxes/' + this.selectionInfo.inboxItem, {trigger: false});
                    this.trigger('change:selection', selectedItem);
                }
            }
        });
    });