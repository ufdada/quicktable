/* jshint node: true */

module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), 
		jshint: {
			all: [
				"lang/*.js", 
				"*.js"
			], 
			options: {
				jshintrc: '.jshintrc'
			}
		},
		lint5: {
			dirPath: "samples",
			templates: [
				"quicktable.html"
			]
			//,
			// ignoreList: [
			// ]
		},
		compress: {
			main: {
				options: {
					archive: 'release/<%= pkg.name %>-<%= pkg.version %>.zip'
				},
				files: [
					{
						src: [
							'**', 
							// Exclude files and folders
							'!node_modules/**', 
							'!release/**', 
							'!.*', 
							'!Gruntfile.js', 
							'!package.json', 
							'!LICENSE', 
							'!CHANGELOG.md', 
							'!README.md', 
							'!template.jst', 
							'!*.zip'
						], 
						dest: '<%= pkg.name %>/'
					}
				]
			}
		},
		markdown: {
			all: {
				files: [
					{
						expand: true,
						src: '*.md',
						dest: 'release/docs/',
						ext: '.html'
					}
				],
				options: {
					template: 'template.jst',
					//preCompile: function(src, context) {},
					//postCompile: function(src, context) {},
					//templateContext: {},
					markdownOptions: {
						gfm: true,
						highlight: 'manual'
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-markdown');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-lint5');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint', 'lint5']);
	grunt.registerTask('build', ['test', 'compress', 'markdown']);
	grunt.registerTask('default', ['test']);
};