define(['framework-core', 'framework-controls', 'views/navigationView', 'views/contentView', 'views/propertiesView',
        'views/documentView', 'template!content/mainView.html'],
    function (Core, Controls, NavigationView, ContentView, PropertiesView, DocumentView, MainTemplate) {
        'use strict';

        var mainView = Core.View.extend({

            className: 'main-view',
            currentGridStyle: 'list',
            currentWFItem: {},

            // events for the toolbar buttons
            domEvents: {
                'select .navigation-collapse-button': function () {
                    this.paneContainer.showPane('navigation');
                },
                'deselect .navigation-collapse-button': function () {
                    this.paneContainer.hidePane('navigation');
                },
                'select .document-collapse-button': function () {
                    this.paneContainer.showPane('document');
                },
                'deselect .document-collapse-button': function () {
                    this.paneContainer.hidePane('document');
                },
                'select .grid-view': function () {
                    this.currentGridStyle = 'grid';
                    this.contentView.setStyle(this.currentGridStyle);
                    this.ShowActionButtonsInToolbar(this.currentWFItem);
                },
                'select .list-view': function () {
                    this.currentGridStyle = 'list';
                    this.contentView.setStyle(this.currentGridStyle);
                    this.ShowActionButtonsInToolbar(this.currentWFItem);
                },
                'select .card-view': function () {
                    this.currentGridStyle = 'card';
                    this.contentView.setStyle(this.currentGridStyle);
                    this.ShowActionButtonsInToolbar(this.currentWFItem);
                },
                'click .wfTask-Transitions': function (event) {
                    this.contentView.onApplyTransition(event);
                },
                'click #moveToPreviousInbox': function (event) {
                    this.contentView.onApplyMove(event);
                },
                'click #moveToMyInbox': function (event) {
                    this.contentView.onApplyMove(event);
                }

                /*,'select .properties-collapse-button': function () {
                 this.paneContainer.showPane('properties');
                 },*/
                /*'deselect .properties-collapse-button': function () {
                 this.paneContainer.hidePane('properties');
                 }*/
            },

            initialize: function (AppContext) {

                //Initialize all views
                this.appContext = AppContext;
                this.navigationView = new NavigationView(AppContext);
                this.contentView = new ContentView(AppContext);
                this.documentView = new DocumentView(AppContext);

                //this.propertiesView = new PropertiesView(AppContext);

                // register for view events
                this.listenTo(this.navigationView, 'change:selection', this.onNavigationSelectionChanged);
                this.listenTo(this.contentView, 'change:selection', this.onContentSelectionChanged);
                this.listenTo(this.contentView, 'update:selection', this.onContentUpdated);
            },

            onNavigationSelectionChanged: function (item) {
                this.currentWFItem = item;
                this.ShowActionButtonsInToolbar(item);
                this.contentView.loadWFItems(item);
                this.documentView.render();
            },

            onContentSelectionChanged: function (item) {
                this.currentWFItem = item;
                this.ShowActionButtonsInToolbar(item);
                this.documentView.loadDocument(item);
            },

            onContentUpdated: function (selectionInfo) {
                this.navigationView.render(selectionInfo);
            },

            ShowActionButtonsInToolbar: function (item) {
                if (item.hasOwnProperty('task') && this.currentGridStyle === 'grid') {

                    if (item.task.canMoveToMyInbox) {
                        document.getElementById('moveToMyInbox').style.display = 'block';
                        document.getElementById('moveToPreviousInbox').style.display = 'none';
                        document.getElementById('transition-actions').style.display = 'none';
                    }
                    else {
                        document.getElementById('moveToMyInbox').style.display = 'none';
                        document.getElementById('transition-actions').style.display = 'block';

                        if (item.task.canMoveToPreviousInbox) {
                            document.getElementById('moveToPreviousInbox').style.display = 'block';
                        }
                        else {
                            document.getElementById('moveToPreviousInbox').style.display = 'none';
                        }
                    }

                } else {
                    document.getElementById('transition-actions').style.display = 'none';
                    document.getElementById('moveToMyInbox').style.display = 'none';
                    document.getElementById('moveToPreviousInbox').style.display = 'none';
                }
            },

            render: function (selectionInfo) {

                // reset and render all views
                this.$element.empty();
                //MainTemplate.renderToView(this, this);
                this.appContext.renderToView(this, MainTemplate, this);
                this.navigationView.render(selectionInfo);
                this.contentView.render();
                this.documentView.render();

                //this.propertiesView.render();

                // create a pane container and panes for each view
                this.paneContainer = new Controls.PaneContainer(this.element);
                this.toolbar = new Controls.Toolbar(this.element.querySelector('.main-toolbar'));
                this.paneContainer.getPane('navigation').element.appendChild(this.navigationView.element);
                this.paneContainer.getPane('content').element.appendChild(this.contentView.element);
                this.paneContainer.getPane('document').element.appendChild(this.documentView.element);

                //this.paneContainer.getPane('properties').element.appendChild(this.propertiesView.element);
            }
        });

        return mainView;
    });