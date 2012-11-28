module.exports = function(grunt) {

  // Default task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.registerTask('default', 'coffee jasmine_node');
  grunt.registerTask('test', 'coffee jasmine_node');
  
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
    }
  });


};
