/**
 * Prior to running this, make sure you have the following
 * NPM packages _globally installed_:
 * 
 *   - `npm install -g expresso`
 *   - `npm install -g mocha`
 * 
 * *Note:* We don't use `expresso` (we are using `mocha`), however
 * currently expresso will successfully install `jscoverage` which
 * doing that by hand doesn't seem to work.
 * 
 * To see a list of targets, type:
 * 
 *     jake -T
 *   
 * The default calls most of the targets:
 * 
 *     jake
 */

var doc    = require('node-idocs');
var api    = require('express-api-docs');

require('jake-utils');

var appjs   = 'router.js';
var code    = [ 'routes' ];      // All source code as an array

var docdest = 'docs';           // Generated docs go here
var apidest = 'public/api.html';  // Generated API documentation
var covlib  = 'test/lib';         // Code coverage library versions

var testLog        = "test/tests.log";
var coverageReport = "test/coverage.html";
var tapReport      = "test/results.tap";

/**
 * Builds everything, including:
 *
 *   - `lint`: Running through the `jslint` process.
 *   - `docs`: Creating all the internal documentation.
 *   - `test`: Testing all of the libraries.
 */

desc('Builds most things');
task('default', ['depends', 'lint', 'test', 'server-docs', 'client-docs', 'api']);
task('jenkins', ['clean', 'depends', 'build', 'lint', 'test-tap', 'coverage', 'server-docs', 'client-docs', 'api'])

/**
 * Creates an file, `build.json` that can be used to identify a deployment. 
 */
desc("Creates the build.json and any other things needed to setup the app");
task("build", function() {
    var versionTag = "-dev";
    if ( process.env.GIT_BRANCH == "stable" ) {
        versionTag = "";
    }
    file.write('public/build.json', {
        "version": project['package'].version + versionTag,
        "build": process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : "local",
        "date" : new Date(),
        "url"  : process.env.BUILD_URL ? process.env.BUILD_URL : "http://localhost"
    });
    
    markdown("README.md", "README.html");
});

/**
 * Generates the public REST API documentation by using the
 * `express-api-docs` project.
 */
desc("Create the public REST API documentation");
task('api', function() {
    start("Generating the REST API Documentation");
    
    api.generate(appjs, apidest);

    end("View documents in '%s'", apidest);
});


/**
 * Create the internal functional documentation in `public/docs`. 
 * 
 * Uses [node-idocs|https://github.com/howardabrams/node-idocs],
 * and open source project.
 */

desc("Create the internal functional documentation in `docs`")
task('server-docs', function() {
    start("Generating the Internal 'Server' Documentation");
    
    doc.generate({
        include: code.concat(appjs),
        output: docdest + "/server"
    });
    
    end("View documents in '%s'", docdest);
});

desc("Create the internal functional documentation in `docs`")
task('client-docs', function() {
    start("Generating the Internal 'Client' Documentation");
    
    doc.generate({
        include: 'public/js',
        exclude: 'lib',
        output: docdest + "/client"
    });
    
    end("View documents in '%s'", docdest);
});

/**
 * Lints all of the script files in the `lib` directory
 * through the [jsHint|https://github.com/jshint/node-jshint] project.
 * 
 * If it encounters any warnings (except for using the `delete()` as a function)
 * it exits with a `1` status code.
 */

desc("Lints all of the script files in the `lib` directory");
task('lint', function(){
    start("Analyzing the Script Files");
    
    lint( code );
    
    end();
});

/**
 * Creates new *coverage-able* versions of the library scripts in the `test/lib`
 * directory.
 *
 * These new library versions can be used by the tests in order to produce
 * code coverage results.
 */

desc("Creates new *coverage-able* versions of the library scripts in the `test/lib` directory.");
task('coverager', function() {
    start("Generating new 'coverage-able' script versions");
    
    jscoverage( code, covlib );

    end("Results stored in '%s'", covlib);
});


/**
 * Runs the tests with the code coveraged library files.
 */
desc("Generates a code coverage report after running the tests");
task('coverage', [ 'coverager' ], function() {
    start("Generating the code coverage report");
    
    process.env.NODE_ENV = "testing";
    rm('-f', coverageReport);
    rm('-f', testLog); 
    
    mochaTests({
        directory: 'test',
        files    : /test\-.*\.js/,
        coverage : true,
        reporter : 'html-cov',
        output   : coverageReport
    });
    
    end("Results stored in '%s'", coverageReport);
});


/**
 * Runs all of the tests and displays the results differently
 * depending on if you run them from the command line (TTY) or 
 * from the Jenkins build server.
 */

desc("Runs the 'mocha' unit tests");
task('test', function(params) {
    start("Running the 'mocha' unit tests");
    process.env.NODE_ENV = "testing";
    rm('-f', testLog); 
    
    var options = {
        directory : 'test',
        files : /test\-.*\.js/,
        coverage : false,
        reporter : 'spec',
    };
    if (params) {
        options.test = params;
    }
    mochaTests(options);

    end("View logs in test/tests.log");
});

desc("Runs the 'mocha' unit tests and stores the results in a TAP file");
task('test-tap', function(){
    start("Running the 'mocha' unit tests");
    process.env.NODE_ENV = "testing";
    rm('-f', testLog); 
    rm('-f', tapReport); 
    
    mochaTests({
        directory: 'test',
        files    : /test\-.*\.js/,
        coverage : false,
        reporter : 'tap',
        output   : tapReport
    });

    end("Report stored in %s", tapReport)
});


/**
 * Installs all of the dependencies in `node_modules`.
 * 
 * This is the same as executing: `npm install` from the command
 * line. This isn't called from the `all` target, so you need to
 * call this the first time.
 */

desc("Installs all of the dependencies in `node_modules`");
task('depends', function() {
    start("Collecting the module dependencies");
    
    if (! exists("node_modules") ) {
        exec("npm install");
    }
    
    end();
});


/**
 * Removes the generated files.
 */

desc("Removes the generated files");
task('clean', function() {
    start("Cleaning generated files");
    
    rm("-rf", covlib);
    rm("-rf", docdest);
    rm("-rf", apidest);
    rm("-rf", coverageReport);
    rm("-rf", tapReport);
    rm("-rf", testLog);

    end();
});