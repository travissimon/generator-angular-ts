'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var ts = require('typescript');
var tsUtil = require('../ts-util.js');

module.exports = yeoman.generators.Base.extend({

	constructor: function() {
		yeoman.generators.Base.apply(this, arguments);
	},


	prompting: function() {
		var done = this.async();
		this.props = {};

		promptForNamespace.apply(this);

		function promptForNamespace() {
			// find the namespace to use
			var entries = fs.readdirSync('src/client/app/pages');
			var directories = entries.filter(function (element, index, array) {
				return element.substring(0, 3) !== '404';
			});

			var newNS = 'Create a new namespace';
			directories.push(newNS);

			this.prompt([{
				type: 'list',
				name: 'namespaceChoice',
				message: 'Namespace',
				choices: directories
			}], function(props) {
				if (props.namespaceChoice === newNS) {
					newNamespacePrompt.apply(this);
				} else {
					this.props.namespace = tsUtil.getCases(props.namespaceChoice);
					this.props.isNew = false;
					promptForPageName.apply(this);
				}
			}.bind(this));
		}
		
		function newNamespacePrompt() {
			this.prompt([{
				type: 'input',
				name: 'namespaceProvided',
				message: 'New namespace'
			}], function(props) {
				this.props.namespace = tsUtil.getCases(props.namespaceProvided);
				this.props.isNew = true;
				promptForPageName.apply(this);
			}.bind(this));
		}

		function promptForPageName() {
			this.prompt([{
				type: 'input',
				name: 'pageName',
				message: 'Page name'
			}], function(props) {
				this.props.pageName = tsUtil.getCases(props.pageName);
				promptForRouteName.apply(this);
			}.bind(this));
		}

		function promptForRouteName() {
			this.prompt([{
				type: 'input',
				name: 'routeName',
				message: 'Route name',
				default: this.props.pageName.raw
			}], function(props) {
				this.props.routeName = tsUtil.getCases(props.routeName);
				promptForRouteUrl.apply(this);
			}.bind(this));
		}

		function promptForRouteUrl() {
			this.prompt([{
				type: 'input',
				name: 'routeUrl',
				message: 'Route URL'
			}], function(props) {
				this.props.routeUrl = props.routeUrl;
				done();
			}.bind(this));
		}

	},

	_createNamespaceDirectory: function(namespace) {
		var dirName = 'src/client/app/pages/' + namespace.kebab;

		var dirExists = true;
		try {
			fs.accessSync(dirName);
		} catch (e) {
			dirExists = false;
		}
		
		if (dirExists) {
			console.log(chalk.yellow('Directory ' + dirName + ' exists -- skipping'));
		} else {
			fs.mkdirSync(dirName);
		}
	},

	_addNamespaceToApplication: function(namespace) {
		tsUtil.addModule(this.fs, 'src/client/app/app.module.ts', 'app.pages.' + namespace.kebab);
	},

	_getRouteFilePath: function(namespace) {
		return 'src/client/app/pages/' + namespace.kebab + '/app.pages.' + namespace.kebab + '.routes.ts';
	},
	_getModuleFilePath: function(namespace) {
		return 'src/client/app/pages/' + namespace.kebab + '/app.pages.' + namespace.kebab + '.module.ts';
	},
	_getControllerFilePath: function(namespace, pagename) {
		return 'src/client/app/pages/' + namespace.kebab + '/' + pagename.kebab + '.controller.ts';
	},
	_getTemplateFilePath: function(namespace, pagename) {
		return 'src/client/app/pages/' + namespace.kebab + '/' + pagename.kebab + '.template.html';
	},

	_addModuleAndRouteFiles: function(namespace, pagename) {		
		var moduleFilepath = this._getModuleFilePath(namespace);
		this.fs.copyTpl(
			this.templatePath('namespace.module.ts'),
			this.destinationPath(moduleFilepath),
			{
				namespace: namespace,
				pagename: pagename
			}
		);

		var routesFilepath = this._getRouteFilePath(namespace);
		this.fs.copyTpl(
			this.templatePath('namespace.routes.ts'),
			this.destinationPath(routesFilepath),
			{
				namespace: namespace,
				pagename: pagename
			}
		);
	},

	_addPageController: function(namespace, pagename) {
		var controllerPath = this._getControllerFilePath(namespace, pagename);
		this.fs.copyTpl(
			this.templatePath('page.controller.ts'),
			this.destinationPath(controllerPath),
			{
				namespace: namespace,
				pagename: pagename
			}
		);
	},

	_addPageTemplate: function(namespace, pagename) {
		var templateFilePath = this._getTemplateFilePath(namespace, pagename);
		this.fs.copyTpl(
			this.templatePath('page.template.html'),
			this.destinationPath(templateFilePath),
			{
				namespace: namespace,
				pagename: pagename
			}
		);
	},

	_addRoute: function(namespace, pageName, routeName, routeUrl, controllerName, templateUrl) {
		var filePath = this._getRouteFilePath(namespace);
		tsUtil.addRoute(this.fs, this.destinationPath(filePath), routeName, routeUrl, controllerName, templateUrl);
	},

	writing: function() {
		if (this.props.isNew) {
			this._createNamespaceDirectory(this.props.namespace);
			this._addNamespaceToApplication(this.props.namespace);
			this._addModuleAndRouteFiles(this.props.namespace, this.props.pageName);
		}

		var templateFilePath = this._getTemplateFilePath(this.props.namespace, this.props.pageName);

		this._addRoute(this.props.namespace, this.props.pageName, this.props.routeName, this.props.routeUrl, this.props.pageName.capital + 'Controller', templateFilePath);

		this._addPageController(this.props.namespace, this.props.pageName);
		this._addPageTemplate(this.props.namespace, this.props.pageName);
	}

	

});
