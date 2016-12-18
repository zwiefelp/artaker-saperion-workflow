define(['framework-core', 'framework-controls', 'template!content/propertiesView.html'],
    function (Core, Controls, PropertiesTemplate) {
        'use strict';

        return Core.View.extend({
            initialize: function (AppContext) {
                this.appContext = AppContext;
            },


            render: function () {
                PropertiesTemplate.renderToView(this);
                this.$element.html(this.appContext.localize('properties'));
            }

        });
    });