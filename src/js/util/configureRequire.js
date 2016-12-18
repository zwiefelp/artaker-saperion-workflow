(function () {

    /**
     * This is supposed to configure require in addition to changes made by the Framework itSelf.
     * Changing the baseUrl is not recomended. This will destoy behavior which e.g. framework-brand need.
     * It has to be prooven that no duplcate naming and pathes exist in final configuration. Use following command in browserConsole
     * to see/verify the final require-configuration: JSON.stringify(requirejs.s.contexts._.config,4,4)
     */

    var basePath = "../devPackages/artaker-saperion-workflow/src";

    // setup configuration
    var additionalRequireConfig = {
        paths: {
            src: basePath,
            config: basePath + "/config",
            content: basePath + "/content",
            js: basePath + "/js",
            views: basePath + "/js/views",
            util: basePath + "/js/util",
            libs: basePath + "/js/lib",
            resources: basePath + "/resources",
            styles: basePath + "/styles"
        }
    };
    // now configure require additionally
    require.config(additionalRequireConfig);

})();