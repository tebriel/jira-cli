module.exports = function(grunt) {

  
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    jasmine_node: {
        projectRoot: "./spec",
        forceExit: false,
        extensions: 'coffee',
        jUnit: {
            report: false,
            savePath : "./build/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
        }
    },
    meta: {
        banner: '#!/usr/bin/env node'
    },
    concat: {
        dist: {
            src: ['<banner>', '<file_strip_banner:lib/jira-cli.js>'],
            dest: 'lib/jira-cli.js'
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
    docco: {
        app: {
            src: ['src/*.coffee']
        }
    }
    
  });

  // Default task.
  grunt.registerTask('default', 'coffee jasmine_node concat');
  grunt.registerTask('test', 'coffee jasmine_node');

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-bump');
};
