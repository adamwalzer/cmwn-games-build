var _ = require('lodash');
var argv = require('yargs').argv;
var gulp = require('gulp');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var webpackDevConfig = require('./webpack.config.dev.js');
var webpackProdConfig = require('./webpack.config.prod.js');
var fs = require('fs');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var header = require('gulp-header');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var inject = require('gulp-inject');
var exec = require('child_process').exec;
var eslint = require('gulp-eslint');
var eslintConfigJs = JSON.parse(fs.readFileSync('./.eslintrc'));
var eslintConfigConfig = JSON.parse(fs.readFileSync('./.eslintrc_config'));
var scsslint = require('gulp-scss-lint');
var stylish = require('gulp-scss-lint-stylish2');

var getGame = function () {
    var index = (_.includes(process.argv, 'build') ? _.indexOf(process.argv, 'build') :
        _.includes(process.argv, 'b') ? _.indexOf(process.argv, 'b') :
        _.includes(process.argv, 'watch') ? _.indexOf(process.argv, 'watch') :
        _.includes(process.argv, 'w') ? _.indexOf(process.argv, 'w') : -1) + 1;

    if (!index) return;

    return _.replace(process.argv[index], '--', '');
};

var getEnv = function (environment) {
    switch (environment) {
        case 'dev':
        case 'development':
            return 'dev';
        case 'stage':
        case 'staging':
            return 'staging';
        default:
            return 'prod';
    }
};

var game = getGame();

var nolivereload = argv.nolr;
var env = getEnv(argv.environment || argv.env || 'prod');
var debug = argv.debug;
// the flag --local should be passed only when working on localhost
var local = argv.local || argv.l;
var now = Date.now();

// Production build
var buildTask = [
    'sass',
    'webpack:build',
    'copy-index',
    'copy-media',
    'clean'
];
gulp.task('default', buildTask);
gulp.task('build', buildTask);
gulp.task('b', buildTask);

function defineEntries(config) {
    // modify some webpack config options
    var varsPath = '../' + env + '-variables.js';
    var mediaPath = '../make_media_globals.js';

    if (typeof game !== 'string') {
        gutil.log('Your game argument must be a string');
        process.exit(1); // eslint-disable-line no-undef
    }

    config = Object.create(config);

    config.resolve = Object.create(config.resolve);
    config.entry = {};
    config.resolve.modulesDirectories = config.resolve.modulesDirectories.slice(0); // clone array
    config.output.filename = game + '/ai.js';
    config.resolve.modulesDirectories.push(__dirname + '/library/' + game + '/components/');
    config.entry = [
        varsPath,
        mediaPath,
        './game-' + game + '/index.js',
    ];

    if (env === 'dev' && local) {
        config.entry.push('webpack/hot/dev-server');
        config.entry.push('webpack-dev-server/client?http://localhost:8080/');
    }

    return config;
}

function webpackBuild(callback, isWatch) {
    var webpackConfig;
    var name;
    var config;
    var compiler;
    var server;

    webpackConfig = env === 'dev' ? webpackDevConfig : webpackProdConfig;
    name = 'webpack:build' + (env === 'dev' ? '-dev' : '');
    config = defineEntries(webpackConfig);

    // run webpack
    compiler = webpack(config, function (err, stats) {
        if (err) throw new gutil.PluginError(name, err);
        gutil.log(`[${name}]`, stats.toString({
            colors: true
        }));
        callback();
    });

    if (isWatch && env === 'dev' && local) {
        server = new WebpackDevServer(compiler, {
            contentBase: 'build',
            hot: true,
            filename: game + '/ai.js',
            publicPath: '/build/',
            stats: {
                colors: true,
            },
        });
        server.listen(8080, 'localhost', function () {});
    }
}
gulp.task('webpack:build', webpackBuild);

gulp.task('sass', function () {
    var varsPath = './' + env + '-variables.scss';

    if (typeof game !== 'string') {
        gutil.log('Your game argument must be a string');
        process.exit(1); // eslint-disable-line no-undef
    }

    gulp
    .src([
        './library/game-' + game + '/**/*.scss',
        './library/game-' + game + '/**/*.css'
    ])
    .pipe(header(fs.readFileSync(varsPath, 'utf8')))
    .pipe(sass({
        includePaths: bourbon.includePaths,
    }).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer({ browsers: ['last 5 versions'] })]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/' + game))
    .pipe(livereload());

    gulp
    .src([
        './library/shared/css/**/*.scss',
        './library/shared/css/**/*.css'
    ])
    .pipe(header(fs.readFileSync(varsPath, 'utf8')))
    .pipe(sass({
        includePaths: bourbon.includePaths,
    }).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(postcss([autoprefixer({ browsers: ['last 5 versions'] })]))
    .pipe(gulp.dest('./build/shared/css'))
    .pipe(livereload());
});

gulp.task('copy-index', function () {
    var indexPath = './library/game-' + game + '/index.html';

    if (typeof game !== 'string') {
        gutil.log('Your game argument must be a string');
        process.exit(1); // eslint-disable-line no-undef
    }

    fs.stat(indexPath, function (err) {
        if (err == null) {
            gulp
            .src(indexPath)
            .pipe(inject(gulp.src('./livereload.js'), {
                starttag: '<!-- inject:livereload -->',
                transform: function (filePath, file) {
                    if (livereload.server) {
                        return '<script>\n' + file.contents.toString('utf8') + '\n</script>';
                    }
                }
            }))
            .pipe(gulp.dest('./build/' + game));
        } else {
            gulp
            .src('./index.html')
            .pipe(inject(gulp.src('./library/game-' + game + '/config.json'), {
                starttag: '<!-- inject:head -->',
                transform: function (filePath, file) {
                    var config = JSON.parse(file.contents.toString('utf8'));
                    var injection = `<title>${config.title || _.startCase(config.id)}</title>\n    ` +
                        `<link rel="stylesheet" type="text/css" href="../shared/css/style.css?d=${now}">\n` +
                        `    <link rel="stylesheet" type="text/css" href="style.css?d=${now}">`;
                    injection += config.head_injection || '';
                    return injection;
                }
            }))
            .pipe(inject(gulp.src('./test-platform-integration.js'), {
                starttag: '<!-- inject:integration -->',
                transform: function (filePath, file) {
                    if (!local) {
                        return '<script>\n    ' +
                            file.contents.toString('utf8') + '\n</script>';
                    }
                }
            }))
            .pipe(inject(gulp.src('./library/game-' + game + '/config.json'), {
                starttag: '<!-- inject:body -->',
                transform: function (filePath, file) {
                    var config = JSON.parse(file.contents.toString('utf8'));
                    var folder = config.media_folder || config.id;
                    var min = debug ? '' : '.min';

                    return (
                        `<div id="${config.id}"></div>\n    ` +
                        '<script type="text/javascript" ' +
                        `src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.2/react${min}.js">` +
                        '</script>\n    ' +
                        '<script type="text/javascript" ' +
                        `src="https://cdnjs.cloudflare.com/ajax/libs/react/15.0.2/react-dom${min}.js">` +
                        '</script>\n    ' +
                        '<script type="text/javascript" ' +
                        `src="../framework/skoash.${config.skoash}.js"></script>\n    ` +
                        `<script>window.CMWN={gameFolder:"${folder}"};</script>\n    ` +
                        `<script type="text/javascript" src="./ai.js?d=${now}"></script>`
                    );
                }
            }))
            .pipe(inject(gulp.src('./livereload.js'), {
                starttag: '<!-- inject:livereload -->',
                transform: function (filePath, file) {
                    if (livereload.server) {
                        return '<script>\n    ' + file.contents.toString('utf8') + '  \n</script>';
                    }
                }
            }))
            .pipe(inject(gulp.src('./google-analytics.js'), {
                starttag: '<!-- inject:ga -->',
                transform: function (filePath, file) {
                    return '<script>\n    ' + file.contents.toString('utf8') + '\n    </script>';
                }
            }))
            .pipe(gulp.dest('./build/' + game));
        }
    });
});

gulp.task('copy-media', function () {
    if (typeof game !== 'string') {
        gutil.log('Your game argument must be a string');
        process.exit(1); // eslint-disable-line no-undef
    }

    // This can be removed once media for every game is transferred to the media server.
    gulp
    .src('./library/game-' + game + '/media/**/*' )
    .pipe(gulp.dest('./build/' + game + '/media'));
});

// To specify what game you'd like to watch call gulp watch --game game-name
// Replace game-name with the name of the game
function watchTask() {
    var isWatch;

    if (typeof game !== 'string') {
        gutil.log('Your game argument must be a string');
        process.exit(1); // eslint-disable-line no-undef
    }

    env = 'dev';
    if (!nolivereload) livereload.listen();

    watch([
        'library/framework/*',
    ], function () {
        gulp.start('copy-framework');
    });

    watch([
        'library/game-' + game + '/**/*.scss',
        'library/game-' + game + '/**/*.css',
        'library/shared/**/*.scss',
        'library/shared/**/*.css',
    ], function () {
        gulp.start('sass');
    });

    watch([
        'library/game-' + game + '/media/**/*',
    ], function () {
        gulp.start('copy-media');
    });

    watch([
        'library/game-' + game + '/*.js',
        'library/game-' + game + '/**/*.js',
        'library/shared/**/*.js',
    ], function () {
        gulp.start('webpack:build');
    });

    watch([
        'library/game-' + game + '/**/*.html',
        'library/game-' + game + '/config.json',
        'library/shared/**/*',
        '!library/game-' + game + '/**/*.js',
        '!library/shared/**/*.js',
        '!library/shared/**/*.scss',
        '!library/shared/**/*.css',
    ], function () {
        gulp.start('build');
    });

    isWatch = gulp.start('build');
    webpackBuild(_.noop, isWatch);
}
gulp.task('watch', watchTask);
gulp.task('w', watchTask);

function cleanTask() {
    // TODO: write alternative for windows 9/13/16 AIM
    if (process.platform !== 'win32') { // eslint-disable-line no-undef
        exec('delete-invalid-files.sh', function (err, stdout, stderr) {
            gutil.log(stdout);
            gutil.log(stderr);
        });
    }
}
gulp.task('clean', cleanTask);

/*·.·´`·.·•·.·´`·.·•·.·´`·.·•·.·´Lint Tasks`·.·•·.·´`·.·•·.·´`·.·•·.·´`·.·•·.·´`·.·*/
gulp.task('lint', ['lint-js', 'lint-config', 'lint-scss']);
gulp.task('lint-js', function () {
    return gulp.src(['library/**/*.js', '!library/**/*.test.js'])
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint(eslintConfigJs))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        .pipe(eslint.format('stylish', fs.createWriteStream('jslint.log')))
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});
gulp.task('lint-config', function () {
    return gulp.src(['gulpfile.js', 'webpack.config.dev.js', 'webpack.config.prod.js'])
        .pipe(eslint(_.defaultsDeep(eslintConfigConfig, eslintConfigJs)))
        .pipe(eslint.format())
        .pipe(eslint.format('stylish', fs.createWriteStream('configlint.log')))
        .pipe(eslint.failAfterError());
});
gulp.task('lint-scss', function () {
    var reporter = stylish();
    return gulp.src(['library/**/*.scss'])
        .pipe(scsslint({
            customReport: reporter.issues,
            reporterOutput: 'scsslint.json',
        }))
        .pipe(reporter.printSummary)
        .pipe(scsslint.failReporter());
});
