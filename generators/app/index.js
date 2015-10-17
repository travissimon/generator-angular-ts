'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var createCompounder = require('lodash/internal/createCompounder');

module.exports = yeoman.generators.Base.extend({

	squashedCapitalizeCase: createCompounder(function(result, word, index) {
		word = word.toLowerCase();
		return result + word.charAt(0).toUpperCase() + word.slice(1);
	}),

	constructor: function() {
		yeoman.generators.Base.apply(this, arguments);
	},
	
	prompting: function () {
		var done = this.async();

		// Have Yeoman greet the user.
		this.log(yosay(
			'Welcome to the ' + chalk.red('Angular/Typscript') + ' generator!'
		));

		var prompts = [{
			type: 'input',
			name: 'projectName',
			message: 'Name of the new project',
			default: this.appname,
		}, {
			type: 'input',
			name: 'description',
			message: 'Description of the project',
		}];

		this.prompt(prompts, function (props) {
			this.props = props;
			this.props.projectNameSnakeCase = _.snakeCase(this.props.projectName);
			this.props.squashedNameSnakeCase = this.squashedCapitalizeCase(this.props.projectName);
			
			done();
		}.bind(this));
	},

	scaffoldFolders: function () {
        mkdirp('src');
        mkdirp('src/client');
        mkdirp('src/client/app');
        mkdirp('src/client/app/components');
        mkdirp('src/client/app/components/api');
        mkdirp('src/client/app/components/navbar');
        mkdirp('src/client/app/components/profiling');
        mkdirp('src/client/app/components/routes');
        mkdirp('src/client/app/components/simple-grid');
        mkdirp('src/client/app/components/stacktrace');
        mkdirp('src/client/app/layout');
        mkdirp('src/client/app/pages');
        mkdirp('src/client/app/pages/admin');
        mkdirp('src/client/app/pages/articles');
        mkdirp('src/client/app/typings');
		mkdirp('src/client/images');
		mkdirp('src/client/styles');
		mkdirp('src/client/styles/bootstrap');
		mkdirp('src/client/templates');
		mkdirp('src/client/test-helpers');
        mkdirp('src/server');
    },

	writing: {
		configFiles: function () {
			this.fs.copyTpl(
				this.templatePath('_bower.json'),
				this.destinationPath('bower.json'),
				{
					projectName: this.props.projectNameSnakeCase,
					description: this.props.description
				}
			);
			this.fs.copy(
				this.templatePath('_bowerrc'),
				this.destinationPath('.bowerrc')
			);
			this.fs.copy(
				this.templatePath('_editorconfig'),
				this.destinationPath('.editorconfig')
			);
			this.fs.copy(
				this.templatePath('_gitignore'),
				this.destinationPath('.gitignore')
			);
			this.fs.copy(
				this.templatePath('_gulp.config.js'),
				this.destinationPath('gulp.config.js')
			);
			this.fs.copy(
				this.templatePath('_gulpfile.js'),
				this.destinationPath('gulpfile.js')
			);
			this.fs.copy(
				this.templatePath('_jscsrc'),
				this.destinationPath('.jscsrc')
			);
			this.fs.copy(
				this.templatePath('_karma.conf.js'),
				this.destinationPath('karma.conf.js')
			);
			this.fs.copyTpl(
				this.templatePath('_package.json'),
				this.destinationPath('package.json'),
				{
					projectName: this.props.squashedNameSnakeCase,
					description: this.props.projectName
				}
			);
			this.fs.copyTpl(
				this.templatePath('_README.md'),
				this.destinationPath('README.md'),
				{
					projectName: this.props.projectName,
					description: this.props.description
				}
			);
		},

		images: function() {
			this.fs.copy('/src/client/favicon*', '/src/client/');
			this.fs.copy('/src/client/images/*.*', '/src/client/images/');
		},

		styles: function() {
			this.fs.copy('/src/client/styles/*.less', '/src/client/styles');
			this.fs.copy('/src/client/styles/bootstrap/*.less', '/src/client/styles/bootstrap');
		},

		indexAndSpec: function() {
			this.fs.copyTpl(
				this.templatePath('/src/client/index.html'),
				this.destinationPath('/src/client/index.html'),
				{
					appName: this.props.projectName
				}
			);
			this.fs.copy(
				this.templatePath('/src/client/specs.html'),
				this.destinationPath('/src/client/specs.html')
			);
		},

		app: function () {
			this.log('More files to copy');
		}

	},

	install: function () {
		this.log('Not installing - uncomment me!');
		// this.installDependencies();
	}
});
