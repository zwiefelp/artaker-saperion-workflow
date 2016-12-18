var assert = chai.assert;
describe('appContext', function () {
    var mocklogger = {
        log: function () {
            console.log('this is log function');
        }
    };
    var mockcore = {
        Strings: {
            load: function () {
                return '';
            }
        }
    };
    var app, productInfo;

    before(function (done) {
        require(['js/util/appContext', 'json!config/productinfo'], function (appContext, productInfoJson) {
            //console.log("productinfo: ", JSON.stringify(productInfoJson, null, 2));
            productInfo = productInfoJson;
            app = appContext.getInstance(mockcore, mocklogger);
            done();
        });
    });

    describe('productInfo', function () {
        it('productInfo.json should contain all referenced properties', function () {
            assert.isDefined(productInfo.productVersion, "productVersion is not defined");
            assert.isDefined(productInfo.availableServers, "availableServers is not defined");
            assert.isDefined(productInfo.features, "features is not defined");
        })

        it('Check the version value', function () {
            assert.isString(productInfo.productVersion, "productInfo.productVersion is not string");
            assert.equal(productInfo.productVersion, app.version, "Value from json file is not equal to appContext");
        });
    });

    it('Check the log function', function () {
        assert.isFunction(app.log, "error in appcontext log function");
    });
});
