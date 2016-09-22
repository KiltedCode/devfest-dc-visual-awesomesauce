
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            src: 'app/js',
            dist: 'js-dev'
        },
        filename: 'olympic-sunburst',
        meta: {
            banner: [
                '/*',
                ' * <%= pkg.name %>',
                ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' */'
            ].join('\n')
        },
        clean: {
            dist: ['js-dev/']
        },
        //copy: {
        //    main: {
        //        files: [
        //            {
        //                expand: true,
        //                cwd: 'src',
        //                src: ['**', '!*.js'],
        //                dest: 'dev/'
        //            }
        //        ]
        //
        //    }
        //},
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>\n'
            },
            modules: {
                files: {
                    '<%= dirs.dist %>/<%= filename %>.js': [
                        '<%= dirs.src %>/app.js',
                        '<%= dirs.src %>/olympic-medals/*config.js',
                        '<%= dirs.src %>/olympic-medals/**/*!(config).js',
                        '<%= dirs.src %>/sunburst-angular-1/*config.js',
                        '<%= dirs.src %>/sunburst-angular-1/*!(config).js'
                    ]
                }
            }
        },
        html2js: {
            options: {
                existingModule: true,
                singleModule: true,
                module: 'rhgeek.sunburst'
            },
            main: {
                src: ['<%= dirs.src %>/sunburst-angular-1/*.tpl.html'],
                dest: '<%= dirs.src %>/sunburst-angular-1/templates.js'
            }
        },
        uglify: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>\n'
            },
            dist: {
                src: ['<%= dirs.dist %>/<%= filename %>.js'],
                dest: '<%= dirs.dist %>/<%= filename %>.min.js'
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');

    // default tasks
    grunt.registerTask('default', ['clean', 'html2js', 'concat', 'uglify']);

};