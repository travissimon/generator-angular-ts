'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var tsUtil = require('../ts-util.js');

module.exports = yeoman.generators.Base.extend({

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
			default: this.appname
		}, {
			type: 'input',
			name: 'description',
			message: 'Description of the project'
		}];

		this.prompt(prompts, function (props) {
			this.props = props;
			this.props.projectName = tsUtil.getCases(this.props.projectName);
			done();
		}.bind(this));
	},

	scaffoldFolders: function () {
        mkdirp('src');
        mkdirp('src/client');
        mkdirp('src/client/app');
        mkdirp('src/client/app/components');
        mkdirp('src/client/app/components/navbar');
        mkdirp('src/client/app/components/profiling');
        mkdirp('src/client/app/components/routes');
        mkdirp('src/client/app/components/simple-grid');
        mkdirp('src/client/app/components/stacktrace');
        mkdirp('src/client/app/layout');
        mkdirp('src/client/app/pages');
        mkdirp('src/client/app/pages/home');
        mkdirp('src/client/app/typings');
		mkdirp('src/client/app/images');
		mkdirp('src/client/app/styles');
		mkdirp('src/client/app/styles/bootstrap');
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
					projectName: this.props.projectName,
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
					projectName: this.props.projectName,
					description: this.props.description
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
			this.fs.copy('/src/client/app/images/*.*', '/src/client/app/images/');
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
			this.fs.copy(
				this.templatePath('/src/client/app/*.*'),
				this.destinationPath('/src/client/app/')
			);

			this.fs.copy(
				this.templatePath('/src/client/app/components/navbar/*.*'),
				this.destinationPath('/src/client/app/components/navbar/')
			);
			this.fs.copy(
				this.templatePath('/src/client/app/components/profiling/*.*'),
				this.destinationPath('/src/client/app/components/profiling/')
			);
			this.fs.copy(
				this.templatePath('/src/client/app/components/routes/*.*'),
				this.destinationPath('/src/client/app/components/routes/')
			);
			this.fs.copy(
				this.templatePath('/src/client/app/components/simple-grid/*.*'),
				this.destinationPath('/src/client/app/components/simple-grid/')
			);
			this.fs.copy(
				this.templatePath('/src/client/app/components/stacktrace/*.*'),
				this.destinationPath('/src/client/app/components/stacktrace/')
			);

			// layout
			this.fs.copy(
				this.templatePath('/src/client/app/layout/*.*'),
				this.destinationPath('/src/client/app/layout/')
			);

			// 404 template
			this.fs.copy(
				this.templatePath('/src/client/app/pages/404.template.html'),
				this.destinationPath('/src/client/app/pages/404.template.html')
			);

			// home
			this.fs.copy(
				this.templatePath('/src/client/app/pages/home/*.*'),
				this.destinationPath('/src/client/app/pages/home/')
			);

			// 404 template
			this.fs.copy(
				this.templatePath('/src/client/app/pages/404.template.html'),
				this.destinationPath('/src/client/app/pages/404.template.html')
			);

			// typings
			this.fs.copy(
				this.templatePath('/src/client/app/typings/*.*'),
				this.destinationPath('/src/client/app/typings/')
			);

			this.fs.copy(
				this.templatePath('/src/client/app/images/*.*'),
				this.destinationPath('/src/client/app/images/')
			);

			this.fs.copy(
				this.templatePath('/src/client/app/styles/*.*'),
				this.destinationPath('/src/client/app/styles/')
			);

			this.fs.copy(
				this.templatePath('/src/client/app/styles/bootstrap/*.*'),
				this.destinationPath('/src/client/app/styles/bootstrap/')
			);

			this.fs.copy(
				this.templatePath('/src/client/app/styles/bootstrap/mixins/*.*'),
				this.destinationPath('/src/client/app/styles/bootstrap/mixins/')
			);

		},

		server: function() {
			this.fs.copy(
				this.templatePath('/src/server/*.*'),
				this.destinationPath('/src/server/')
			);

			this.fs.copy(
				this.templatePath('/src/server/utils/*.*'),
				this.destinationPath('/src/server/utils/')
			);
		}
		
	},

	install: function () {
		this.log('Not installing - uncomment me!');
		// this.installDependencies();
	}
});
