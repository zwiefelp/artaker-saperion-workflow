/**********************************************************************************************************************/
/* build scripts for saperion template                                                                                */
/* gulp buildPackage --> builds only the package (minified)                                                           */
/* gulp buildPackage-debug --> builds only the package (not minified)                                                 */
/* gulp dist --> generates a deployable folder with runtime, dependend packages and package (minified)                */
/* gulp dist-debug --> generates a deployable folder with runtime, dependend packages and package (not minified)      */
/* gulp serve-debug --> sets up a webserver with live reload                                                          */
/* gulp serve --> sets up a server without live reload                                                                */
/* gulp ci --> generates a deployable tested zip with runtime, dependend packages and package (minified)              */
/* gulp ci-debug --> generates a deployable tested zip with runtime, dependend packages and package (not minified)    */
/**********************************************************************************************************************/


/*eslint-env es6 */
/*eslint-disable strict*/
'use strict';

// gulp dependecies
const gulp = require('gulp');
var eslint = require('gulp-eslint');
var reporter = require('eslint-html-reporter');
var fs = require('fs');
const del = require('del');
const connect = require('gulp-connect');
const open = require('gulp-open');
const zip = require('gulp-zip');

// needed for experience build plugin
const metadata = require('./bower.json');
const buildMetadata = require('./package.json');
const build = require('lexmark-package-build')(metadata, buildMetadata);

// test dependencies
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var istanbulReport = require('gulp-istanbul-report');

// pathes

// path to the sources of the package
const ownPackageSrc = './src/';
// path to the sources of the package
const ownPackageTest = './test/';
// path to the dependend packages
const packagesSrc = './packages/';

// path to the experience runtime
const runtime = './run/src/';
// path to the build folder
const ownPackageBuild = './build/';
// path to the global distribution folder
const dist = './dist/';
// path to the web distribution folder
const wwwDist = dist + 'www/';
// path to the destination of the dependend packages for distribution
const packagesDist = wwwDist + './packages';
// path to the destination of the package for distribution
const ownPackageDist = wwwDist + 'devPackages/' + metadata.name + '/';
// path to the test reports
const reportsDist = dist + './reports';


/**********************************************************************************************************************/
/* default build task                                                                                                 */
/**********************************************************************************************************************/
gulp.task('default', ['build']);

/**********************************************************************************************************************/
/* cleaning scripts                                                                                                   */
/**********************************************************************************************************************/
gulp.task('clean-test', function () {
    return del([reportsDist]).then(paths => {
        console.log('Deleted folders:\n', paths.join('\n'));
    })
});

gulp.task('clean-packageBuild', function () {
    return del([ownPackageBuild]).then(paths => {
        console.log('Deleted folders:\n', paths.join('\n'));
    })
});

gulp.task('clean-dist', function () {
    return del([wwwDist]).then(paths => {
        console.log('Deleted folders:\n', paths.join('\n'));
    })
});

gulp.task('clean-complete', ['clean-dist', 'clean-packageBuild'], function () {
    return del(['./packages', './node_modules']).then(paths => {
        console.log('Deleted folders:\n', paths.join('\n'));
    })
});


/**********************************************************************************************************************/
/* package build                                                                                                      */
/* -->  builds only the package with linting                                                                          */
/**********************************************************************************************************************/
gulp.task('init-buildPackage', ['clean-packageBuild'], function () {
    return build.mkdir.sync(ownPackageBuild);
});

gulp.task('buildPackage', ['browser-test', 'init-buildPackage'], function () {
    gulp.src(['./bower.json']).pipe(gulp.dest(ownPackageBuild));
    return build.rjsBuild({
        optimize: 'uglify' /*, generateSourceMaps: 'true'*/
    });
});

gulp.task('buildPackage-debug', ['browser-test', 'init-buildPackage'], function () {
    gulp.src(['./bower.json']).pipe(gulp.dest(ownPackageBuild));
    gulp.src([ownPackageTest + '**/*']).pipe(gulp.dest(ownPackageBuild + 'test'));
    return gulp.src([ownPackageSrc + '**/*']).pipe(gulp.dest(ownPackageBuild + 'src'));
});


/**********************************************************************************************************************/
/* distribution scripts (complete build)                                                                              */
/* --> generates a deployable folder with runtime, dependend packages and package                                     */
/**********************************************************************************************************************/
gulp.task('init-dist', ['clean-dist'], function () {
    return build.mkdir.sync(wwwDist);
});

gulp.task('dist', ['init-dist', 'buildPackage'], function () {
    gulp.src([ownPackageBuild + '**/*']).pipe(gulp.dest(ownPackageDist));
    //copy packages and runtime
    gulp.src([runtime + '**/*']).pipe(gulp.dest(wwwDist));    
    return gulp.src([packagesSrc + '**/*']).pipe(gulp.dest(packagesDist));
});


gulp.task('dist-debug', ['clean-dist'], function () {
    //copy own package
    gulp.src(['./bower.json']).pipe(gulp.dest(ownPackageDist));
    gulp.src([ownPackageSrc + '**/*']).pipe(gulp.dest(ownPackageDist + 'src'));
    gulp.src([ownPackageTest + '**/*']).pipe(gulp.dest(ownPackageDist + 'test'));
    //copy packages and runtime
    gulp.src([runtime + '**/*']).pipe(gulp.dest(wwwDist));    
    return gulp.src([packagesSrc + '**/*']).pipe(gulp.dest(packagesDist));
});

/**********************************************************************************************************************/
/* start scripts                                                                                                      */
/* --> starts a webserver                                                                                             */
/**********************************************************************************************************************/
gulp.task('serve-debug', ['serve'], function () {
    var watcher = gulp.watch([ownPackageSrc + '**/*'], ['dist-debug']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('serve', ['dist-debug'], function () {
    //Serving at http://localhost:8092
    connect.server({
        port: 8092,
        host: '0.0.0.0', //Bind to all interfaces
        root: [wwwDist]
    });
    return gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:8092'
        }));

});


/**********************************************************************************************************************/
/* ci scripts                                                                                                         */
/* --> generates a deployable tested zip with runtime, dependend packages and package                                 */
/**********************************************************************************************************************/
gulp.task('ci', ['browser-test', 'dist'], function () {
    return gulp.src(wwwDist + '**/*')
        .pipe(zip(metadata.name + ' ' + metadata.version + '.zip'))
        .pipe(gulp.dest(dist));
});


gulp.task('ci-debug', ['browser-test', 'dist-debug'], function () {
    return gulp.src(wwwDist + '**/*')
        .pipe(zip(metadata.name + ' ' + metadata.version + '.zip'))
        .pipe(gulp.dest(dist));
});


/**********************************************************************************************************************/
/* testing scripts                                                                                                    */
/**********************************************************************************************************************/
gulp.task('init-test', ['clean-test'], function () {
    return build.mkdir.sync(reportsDist + '/eslint/');
    return build.mkdir.sync(reportsDist + '/coverage/');
    return build.mkdir.sync(reportsDist + '/test/');
});

gulp.task('lint', ['init-test'], function () {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format(reporter, function (results) {
            fs.writeFileSync(reportsDist + '/eslint/report-results.html', results);
        }));
});

gulp.task('pre-test', ['lint'], function () {
    return gulp.src(['src/**/*.js'])
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
    return gulp.src(['test/**/*.js'], {
            read: false
        })
        .pipe(mocha({
            reporter: 'mocha-junit-reporter',
            reporterOptions: {
                mochaFile: reportsDist + '/test/junit.xml'
            }
        }))
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports({
            dir: reportsDist + '/coverage',
            reporters: ['html']
        }))
        // Checks coverage against minimum acceptable thresholds. Fails the build if any of the thresholds are not met.
        .pipe(istanbul.enforceThresholds({
            thresholds: {
                global: 50
            }
        }));
});


gulp.task('browser-test', ['pre-test'], function () {
    return gulp.src('test/runner.html', {
            read: false
        })
        .pipe(mochaPhantomJS({
            hooks: 'mocha-phantomjs-istanbul',
            dump: 'test.log'
        }))
        .on('finish', function () {
            gulp.src('./coverage/coverage.json')
                .pipe(istanbulReport({
                    reporterOpts: {
                        dir: reportsDist + '/coverage',
                    },
                    reporters: [
                     'text-summary', // outputs summary to stdout, uses default options 
                        {
                            'name': 'text',
                            file: 'report.txt'
                        }, // -> coverage/report.txt  
                 ]
                }));
            gulp.src('test.log', {
                    base: './'
                })
                .pipe(gulp.dest(reportsDist + '/test'));
        });
});