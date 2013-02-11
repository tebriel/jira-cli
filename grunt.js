module.exports = function(grunt) {

  
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    jasmine_node: {
        projectRoot: "./spec",
        extensions: 'coffee',
    },
    meta: {
        banner: '#!/usr/bin/env node'
    },
    concat: {
        dist: {
            src: ['<banner>', '<file_strip_banner:lib/jira.js>'],
            dest: 'lib/jira.js'
        } 
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: ['src/**/*.coffee','spec/**/*.coffee'],
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true
      }
    },
    coffee: {
        compile: {
            files: {
                'lib/*.js': ['src/*.coffee']
            }
        }
    },
    coffeelint: { 
        app: ['src/*.coffee'],
    },
    coffeelintOptions: {
        indentation: {
            value: 4,
            level: "error"
        }
    },
    docco: {
        app: {
            src: ['src/*.coffee']
        }
    }
    
  });

  // Default task.
  grunt.registerTask('default', 'coffeelint coffee jasmine_node concat');
  grunt.registerTask('test', 'coffeelint coffee jasmine_node');
  grunt.registerTask('prepare', 'coffeelint coffee jasmine_node docco concat bump');
  grunt.registerTask('force', 'coffeelint coffee jasmine_node docco concat');

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-coffeelint');
};
