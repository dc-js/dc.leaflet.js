module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '!grunt-lib-phantomjs']
    });
    require('time-grunt')(grunt);

    var config = {
        src: 'src',
        spec: 'spec',
        web: 'web',
        pkg: require('./package.json'),
        banner: grunt.file.read('./LICENSE_BANNER'),
        jsFiles: module.exports.jsFiles
    };

    grunt.initConfig({
        conf: config,

        concat: {
            options : {
                process: true,
                sourceMap: true,
                banner : '<%= conf.banner %>'
            },
            js: {
                src: '<%= conf.jsFiles %>',
                dest: '<%= conf.pkg.name %>.js'
            }
        },
        uglify: {
            jsmin: {
                options: {
                    mangle: true,
                    compress: true,
                    sourceMap: true,
                    banner : '<%= conf.banner %>'
                },
                src: '<%= conf.pkg.name %>.js',
                dest: '<%= conf.pkg.name %>.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['<%= conf.src %>/**/*.js'],
                tasks: ['docs']
            },
            tests: {
                files: ['<%= conf.src %>/**/*.js', '<%= conf.spec %>/**/*.js'],
                tasks: ['test']
            },
            reload: {
                files: ['<%= conf.pkg.name %>.js',
                        '<%= conf.pkg.name %>css',
                        '<%= conf.web %>/js/<%= conf.pkg.name %>.js',
                        '<%= conf.web %>/css/<%= conf.pkg.name %>.css',
                        '<%= conf.pkg.name %>.min.js'],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8888,
                    base: '.'
                }
            }
        },
        copy: {
            'dc-to-gh': {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: [
			    'leaflet-legend.css',
                            'node_modules/leaflet/dist/leaflet.css',
                            'node_modules/@wesselkuipers/leaflet.markercluster/dist/MarkerCluster.Default.css',
                            'node_modules/@wesselkuipers/leaflet.markercluster/dist/MarkerCluster.css',
                            'node_modules/dc/dist/style/dc.css'
                        ],
                        dest: '<%= conf.web %>/css/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: [
                            '<%= conf.pkg.name %>.js',
                            '<%= conf.pkg.name %>.js.map',
                            '<%= conf.pkg.name %>.min.js',
                            '<%= conf.pkg.name %>.min.js.map',
                            'node_modules/d3/dist/d3.js',
                            'node_modules/dc/dist/dc.js',
                            'node_modules/leaflet/dist/leaflet.js',
                            'node_modules/leaflet/dist/leaflet-src.js',
                            'node_modules/@wesselkuipers/leaflet.markercluster/dist/leaflet.markercluster.js',
                            'node_modules/crossfilter2/crossfilter.js'
                        ],
                        dest: '<%= conf.web %>/js/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        nonull: true,
                        src: [
                            'node_modules/leaflet/dist/images/*'
                        ],
                        dest: '<%= conf.web %>/css/images'
                    },
                ]
            }
        },
        'gh-pages': {
            options: {
                base: '<%= conf.web %>',
                message: 'Synced from from master branch.'
            },
            src: ['**']
        },
        shell: {
            merge: {
                command: function (pr) {
                    return [
                        'git fetch origin',
                        'git checkout master',
                        'git reset --hard origin/master',
                        'git fetch origin',
                        'git merge --no-ff origin/pr/' + pr + ' -m \'Merge pull request #' + pr + '\''
                    ].join('&&');
                },
                options: {
                    stdout: true,
                    failOnError: true
                }
            },
            amend: {
                command: 'git commit -a --amend --no-edit',
                options: {
                    stdout: true,
                    failOnError: true
                }
            },
            hooks: {
                command: 'cp -n scripts/pre-commit.sh .git/hooks/pre-commit' +
                    ' || echo \'Cowardly refusing to overwrite your existing git pre-commit hook.\''
            }
        }
    });

    // custom tasks
    grunt.registerMultiTask('emu', 'Documentation extraction by emu.', function () {
        var emu = require('emu'),
            srcFile = this.files[0].src[0],
            destFile = this.files[0].dest,
            source = grunt.file.read(srcFile);
        grunt.file.write(destFile, emu.getComments(source));
        grunt.log.writeln('File \'' + destFile + '\' created.');
    });
    grunt.registerTask('merge', 'Merge a github pull request.', function (pr) {
        grunt.log.writeln('Merge Github Pull Request #' + pr);
        grunt.task.run(['shell:merge:' + pr, 'test' , 'shell:amend']);
    });
    grunt.registerMultiTask('toc', 'Generate a markdown table of contents.', function () {
        var marked = require('marked'),
            slugify = function (s) { return s.trim().replace(/[-_\s]+/g, '-').toLowerCase(); },
            srcFile = this.files[0].src[0],
            destFile = this.files[0].dest,
            source = grunt.file.read(srcFile),
            tokens = marked.lexer(source),
            toc = tokens.filter(function (item) {
                return item.type === 'heading' && item.depth === 2;
            }).reduce(function (toc, item) {
                return toc + '  * [' + item.text + '](#' + slugify(item.text) + ')\n';
            }, '');

        grunt.file.write(destFile, '# dc.leaflet.js API\n' + toc + '\n' + source);
        grunt.log.writeln('Added TOC to \'' + destFile + '\'.');
    });
    grunt.registerTask('test-stock-example', 'Test a new rendering of the stock example web page against a ' +
                       'baseline rendering', function (option) {
                           require('./regression/stock-regression-test.js').testStockExample(this.async(), option === 'diff');
                       });
    grunt.registerTask('update-stock-example', 'Update the baseline stock example web page.', function () {
        require('./regression/stock-regression-test.js').updateStockExample(this.async());
    });

    // task aliases
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('docs', ['build', 'copy']);
    grunt.registerTask('web', ['docs', 'gh-pages']);
    grunt.registerTask('server', ['docs', 'connect:server', 'watch:scripts']);
    grunt.registerTask('default', ['build']);
};

module.exports.jsFiles = [
    'src/banner.js',   // NOTE: keep this first
    'src/core.js',
    'src/leafletBase.js',
    'src/legend.js',
    'src/markerChart.js',
    'src/choroplethChart.js',
    'src/bubbleChart.js',
    'src/footer.js'  // NOTE: keep this last
];
