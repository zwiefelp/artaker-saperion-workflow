/**
 * Document view is responsible to load the document and for the viewer functionality.
 */
define(['jquery', 'framework-core', 'framework-controls', 'template!content/documentView.html'],
    function ($, Core, Controls, DocumentTemplate) {
        'use strict';

        return Core.View.extend({

            /**
             * Event listener for viewer events.
             */
            domEvents: {
                'click #prevPageButton': 'onNavigation',
                'click #nextPageButton': 'onNavigation',
                'change #current-page-display': 'onNavigation',
                'keydown #current-page-display': 'onNavigation',
                'click #btnBestFit': 'onScaling',
                'click #btnFitWidth': 'onScaling',
                'click #btnFitHeight': 'onScaling',
                'click #btnOriginalSize': 'onScaling',
                'click #btnZoomOut': 'onScaling',
                'click #btnZoomIn': 'onScaling',
                'click #btnRotateLeft': 'onRotation',
                'click #btnRotateRight': 'onRotation'
            },

            /**
             * Set initial values to the variables.
             * @param AppContext globally used app context.
             */
            initialize: function (AppContext) {
                this.appContext = AppContext;
                this.currentPDFDoc = {};
                this.currentViewport = {};
                this.currentPageNum = 1;
                this.pageRendering = false;
                this.pageNumPending = null;
                this.currentScale = 1;
                this.currentRotation = 0;
                this.progressIndicator = {};
            },

            /**
             * show/hide buttons and pdf or image tags.
             */
            showHidePDFDiv: function (isPDF,noContent) {
                var pdfDiv = document.getElementById('the-canvas');
                var imageDiv = document.getElementById('noContent');
                var toolbar = document.getElementById('viewerToolbar');
                var nopdfDiv=document.getElementById('noPdfContent');

                if (isPDF) {
                    pdfDiv.style.visibility = 'visible';
                    imageDiv.style.visibility = 'hidden';
                    nopdfDiv.style.visibility = 'hidden';
                    toolbar.style.visibility = 'visible';
                }
                else {
                    pdfDiv.style.visibility = 'hidden';                    
                    toolbar.style.visibility = 'hidden';
                    if(noContent)
                    {
                        imageDiv.style.visibility = 'visible';
                        nopdfDiv.style.visibility = 'hidden';
                    }
                    else {
                        imageDiv.style.visibility ='hidden' ;
                        nopdfDiv.style.visibility = 'visible';
                    }
                }
            },


            /**
             * Clean and set up view with, called at app start.
             */
            render: function () {
                // reset and render all views
                this.$element.empty();
                this.appContext.renderToView(this, DocumentTemplate, this);

                // create a pane container with and panes for each view
                this.paneContainer = new Controls.PaneContainer(this.element);
                this.toolbar = new Controls.Toolbar(this.element.querySelector('.viewer-toolbar'));
            },

            /**
             * Sets rotation of pdf page.
             * @param event identifier which button was pressed
             */
            onRotation: function (event) {
                switch (event.currentTarget.id) {
                    case 'btnRotateRight':
                        this.currentRotation += 90;
                        break;
                    case 'btnRotateLeft':
                        this.currentRotation -= 90;
                        break;
                    default:
                        break;
                }
                this.queueRenderPage(this.currentPageNum);
            },

            /**
             * Navigation of pdf pages.
             * @param event identifier which button was pressed
             */
            onNavigation: function (event) {
                switch (event.currentTarget.id) {
                    case 'prevPageButton':
                        if (this.currentPageNum <= 1) {
                            return;
                        }
                        this.currentPageNum--;
                        break;
                    case 'nextPageButton':
                        if (this.currentPageNum >= this.currentPDFDoc.numPages) {
                            return;
                        }
                        this.currentPageNum++;
                        break;
                    case 'current-page-display':
                        if (event.keyCode === 13 || event.type === 'change') {
                            var newPageNumber = event.currentTarget.valueAsNumber;
                            if (isNaN(newPageNumber) || newPageNumber <= 0 || newPageNumber > this.currentPDFDoc.numPages) {
                                event.currentTarget.value = this.currentPageNum;
                                return;
                            }
                            else {
                                this.currentPageNum = newPageNumber;
                            }
                        }
                        else {
                            return;
                        }
                        break;
                    default:
                        break;
                }

                this.queueRenderPage(this.currentPageNum);
            },

            /**
             * Scaling of pdf pages.
             * @param event identifier which button was pressed
             */
            onScaling: function (event) {

                var viewerPane = document.getElementById('documentViewViewer');
                var clientWidth = viewerPane.clientWidth;
                var clientHeight = viewerPane.clientHeight;

                var maxWidth = this.currentViewport.width;
                var maxHeight = this.currentViewport.height;

                switch (event.currentTarget.id) {
                    case 'btnBestFit':
                        if ((maxHeight / maxWidth) < (clientHeight / clientWidth)) {
                            this.currentScale = ((clientWidth) / maxWidth * this.currentScale);
                        } else {
                            this.currentScale = ((clientHeight) / maxHeight * this.currentScale);
                        }
                        break;
                    case 'btnFitWidth':
                        this.currentScale = ((clientWidth) / maxWidth * this.currentScale);
                        break;
                    case 'btnFitHeight':
                        this.currentScale = ((clientHeight) / maxHeight * this.currentScale);
                        break;
                    case 'btnOriginalSize':
                        this.currentScale = 1;
                        this.currentRotation = 0;
                        break;
                    case 'btnZoomOut':
                        this.currentScale -= 0.25;
                        break;
                    case 'btnZoomIn':
                        this.currentScale += 0.25;
                        break;
                    default:
                        break;
                }

                this.queueRenderPage(this.currentPageNum);
            },

            /**
             * Asynchronously downloads PDF and shows first page
             * @param item wfItem with the information about the task and the document
             */
            loadDocument: function (item) {

                var self = this;
                this.currentPageNum = 1;
                this.currentScale = 1;
                this.currentRotation = 0;

                // check if we have a valid member
                if (item.hasOwnProperty('task')) {

                    // just show pdf files
                    if (item.task.hasDocument) {

                        // show progress indicator while loading the document
                        var parent = document.getElementById('documentView');
                        this.progressIndicator = Controls.ProgressIndicator.show({
                            parent: parent,
                            isModal: false,
                            isIndeterminate: true
                        });

                        try {

                            // load additional object details
                            item.task.document.refresh().then(
                                function (doc) {
                                    // check if we have docs that we can load (pdf)
                                    if (doc.contentList.length > 0 && doc.contentList[0].isFile && doc.contentList[0].fileName.substr(-"pdf".length) === "pdf") {
                                        // we just load the first doc
                                        doc.contentList[0].getBinary().then(
                                            function (result) {
                                                // load the document
                                                window.PDFJS.getDocument(result.data).then(function (pdfDoc_) {
                                                    self.currentPDFDoc = pdfDoc_;
                                                    // set page count
                                                    document.getElementById('page-count-display').value = self.currentPDFDoc.numPages;
                                                    // make pdf view visible
                                                    self.showHidePDFDiv(true, false);
                                                    // renders given page
                                                    self.renderPage(self.currentPageNum);
                                                }, function (error) {
                                                    self.progressIndicator.close();
                                                    self.showHidePDFDiv(false, false);
                                                    self.appContext.log('getBinary failed because of: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                                                });
                                            }, function (error) {
                                                self.progressIndicator.close();
                                                self.showHidePDFDiv(false, false);
                                                self.appContext.log('getDocument failed because of: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                                            }
                                        );
                                    }
                                    else if (!doc.contentList[0].fileName.endsWith(".pdf")) {
                                        // we have non-pdf doc to show
                                        self.progressIndicator.close();
                                        self.showHidePDFDiv(false, false);

                                        self.appContext.log('No pdf documents available', self.appContext.getLogLevels().INFO, false);
                                    }
                                    else {
                                        // we have no doc to show
                                        self.progressIndicator.close();
                                        self.showHidePDFDiv(false, true);
                                        self.appContext.log('No documents available', self.appContext.getLogLevels().INFO, false);
                                    }
                                },
                                function (error) {
                                    self.progressIndicator.close();
                                    self.showHidePDFDiv(false, false);
                                    self.appContext.log('refresh failed because of: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                                }
                            );
                        }
                        catch (error)
                        {
                            self.progressIndicator.close();
                            self.showHidePDFDiv(false, false);
                            self.appContext.log('An error occured while loading the document: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                        }
                    }
                }               
            },

            /**
             * Get page info from document, resize canvas accordingly, and render page.
             * @param newPageNum Page number.
             */
            renderPage: function (newPageNum) {
                this.pageRendering = true;
                var self = this;

                // Using promise to fetch the page
                this.currentPDFDoc.getPage(newPageNum).then(
                    function (page) {

                        // find the canvas and set options for the render context
                        var canvas = document.getElementById('the-canvas');
                        page.pageInfo.rotate = self.currentRotation;
                        var context = canvas.getContext('2d');
                        self.currentViewport = page.getViewport(self.currentScale);
                        canvas.height = self.currentViewport.height;
                        canvas.width = self.currentViewport.width;

                        // Render PDF page into canvas context
                        var renderContext = {
                            canvasContext: context,
                            viewport: self.currentViewport
                        };
                        var renderTask = page.render(renderContext);

                        // Wait for rendering to finish and refresh the current page label
                        renderTask.promise.then(function () {
                                document.getElementById('current-page-display').value = newPageNum;
                                self.progressIndicator.close();
                                self.pageRendering = false;
                                if (self.pageNumPending !== null) {
                                    // New page rendering is pending
                                    self.renderPage(self.pageNumPending);
                                    self.pageNumPending = null;
                                }
                            },
                            function (error) {
                                self.appContext.log('renderTask failed because of: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                                self.progressIndicator.close();
                            }
                        );
                    },
                    function (error) {
                        self.appContext.log('getPage failed because of: ' + error.message, self.appContext.getLogLevels().ERROR, false);
                        self.progressIndicator.close();
                    }
                );
            },

            /**
             * If another page rendering is in progress, wait until the rendering is
             * finished. Otherwise, executes rendering immediately.
             */
            queueRenderPage: function (newPageNum) {
                if (this.pageRendering) {
                    this.pageNumPending = newPageNum;
                } else {
                    this.renderPage(newPageNum);
                }
            }

        });
    });
