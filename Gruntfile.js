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
                '--web-security': 'no',
                coverage: {
                    src: [ 'src/**/*.js' ],
                    instrumentedFiles: 'test/instrumented',
                    htmlReport: 'coverage',
                    coberturaReport: 'coverage',
                    linesThresholdPct: 80
                }
            },
            all: [ 'test/*.html' ]
        },
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: [ 'Gruntfile.js', 'src/**/*.js' ]
            }
        },
        karma: {
            options: {
                configFile: 'karma.js',
                singleRun: true
            },
            continuous: {
                browsers: [ 'Firefox', 'PhantomJS' ]
            },
            dev: {
                browsers: [ 'Chrome', 'Firefox', 'PhantomJS' ],
                background: true
            }
        },
        watch: {
            files: [
                'src/**/*.js',
                'test/**/*.js'
            ],
            tasks: 'lint qunit concat uglify'
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-qunit-istanbul' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-karma' );

    // Default task.
    grunt.registerTask( 'default', 'jshint qunit karma:dev concat uglify'.split( ' ' ) );

};
