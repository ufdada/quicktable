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
		}
	});

	grunt.loadNpmTasks('grunt-lint5');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint', 'lint5']);
	grunt.registerTask('default', ['test']);
};