module.exports = (grunt) ->
    grunt.initConfig
        jasmine_node:
            projectRoot: "."
            requirejs: false
            forceExit: true
            extensions: 'coffee'
        coffee:
            compile:
                expand: true
                flatten: true
                cwd: '.'
                src: ['src/*.coffee']
                dest: 'lib/'
                ext: '.js'
        docco:
            compile:
                src: ['src/*.coffee']
                options:
                    output: 'docs/'
        coffeelint:
            app: ['src/*.coffee', 'Gruntfile.coffee']
            options:
                indentation:
                    value: 4
        concat:
            options:
                stripBanners: true
                banner: '#!/usr/bin/env node\n'
            dist:
                src: ['lib/jira.js']
                dest: 'lib/jira.js'


    grunt.loadNpmTasks 'grunt-jasmine-node'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-docco'
    grunt.loadNpmTasks 'grunt-bump'
    grunt.loadNpmTasks 'grunt-coffeelint'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default',
        ['coffeelint', 'coffee', 'jasmine_node', 'concat']
    grunt.registerTask 'test',
        ['coffeelint', 'coffee', 'jasmine_node']
    grunt.registerTask 'prepare',
        ['coffeelint', 'coffee', 'jasmine_node', 'docco', 'concat', 'bump']
    grunt.registerTask 'force',
        ['coffeelint', 'coffee', 'jasmine_node', 'docco', 'concat']
