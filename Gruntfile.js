'use strict';
module.exports = function( grunt ) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                dest: 'dist/<%= pkg.name %>.js',
                src: [
                    'src/Dexter.js',
                    'src/Dexter.fakeXHR.js'
                ]
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                codegen: { ascii_only: true }
            },
            dist: {
                dest: 'dist/<%= pkg.name %>.min.js',
                src: '<%= concat.dist.dest %>'
            }

        },
        qunit: {
            options : {
                timeout: 30000,
                '--web-security': 'no',
                coverage: {
                    src: [ 'src/**/*.js' ],
                    instrumentedFiles: 'test/temp',
                    htmlReport: 'build/report/coverage',
                    lcovReport: 'build/report/lcov',
                    linesThresholdPct: 80
                }
            },
            all: [ 'test/*.html' ]
        },
        coveralls: {
            all: {
                // LCOV coverage file relevant to every target
                src: 'build/report/lcov/lcov.info'
            }
        },
        nodeunit: {
            all: [ 'test/test-node.js' ]
        },
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: [ 'Gruntfile.js', 'src/**/*.js' ]
            }
        },
        mdoc: {
            options: {
                baseTitle: 'DexterJS',
                indexContentPath: 'README.md'
            },
            docs: {
                files: {
                    'docs/html': 'docs'
                }
            }
        },
        watch: {
            code : {
                files: [
                    'src/**/*.js',
                    'test/**/*.js'
                ],
                tasks: 'lint qunit concat uglify'
            },
            docs : {
                files : [
                    '<%= mdoc.src %>'
                ],
                tasks: 'mdoc'
            }
        }
    });

    [
        'grunt-contrib-jshint',
        'grunt-qunit-istanbul',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-nodeunit',
        'grunt-contrib-watch',
        'grunt-coveralls'
    ].forEach( function( task ) {
        grunt.loadNpmTasks( task );
    });

    grunt.registerMultiTask( 'mdoc', function () {
        var opts = this.options(),
            mdoc = require( 'mdoc' );

        this.files.forEach( function ( file ) {
            opts.inputDir = file.src[ 0 ];
            opts.outputDir = file.dest;

            mdoc.run( opts );
        });
    });

    // Default task.
    grunt.registerTask( 'default', 'jshint qunit concat uglify nodeunit'.split( ' ' ) );

};
