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
			var componentPrefix = 'components - ';
			var pagesPrefix = 'pages - ';

			// find the namespace to use
			var componentsEntries = fs.readdirSync('src/client/app/components').map(
				function(el) {
					return componentPrefix + el.toString();
				}
			);

			var pagesEntries = fs.readdirSync('src/client/app/pages').filter(
				function (element, index, array) {
					return element.substring(0, 3) !== '404';
				}
			).map(
				function(el) {
					return pagesPrefix + el.toString();
				}
			);

			var newNS = 'Create a new component';
			var namespaces = [newNS];
			namespaces = namespaces.concat(componentsEntries);
			namespaces = namespaces.concat(pagesEntries);

			this.prompt([{
				type: 'list',
				name: 'namespaceChoice',
				message: 'Namespace',
				choices: namespaces
			}], function(props) {
				if (props.namespaceChoice === newNS) {
					this.props.isComponent = true;
					newNamespacePrompt.apply(this);
				} else {
					var selected = props.namespaceChoice;
					var ns = '';
					if (selected.startsWith(componentPrefix)) {
						this.props.isComponent = true;
						ns = selected.substring(componentPrefix.length);
					} else {
						this.props.isComponent = false;
						ns = selected.substring(pagesPrefix.length);
					}
					this.props.namespace = tsUtil.getCases(ns);
					this.props.isNew = false;
					promptForServiceName.apply(this);
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
				promptForServiceName.apply(this);
			}.bind(this));
		}

		function promptForServiceName() {
			this.prompt([{
				type: 'input',
				name: 'serviceName',
				message: 'Service name'
			}], function(props) {
				this.props.service = tsUtil.getCases(props.serviceName);
				done();
			}.bind(this));
		}


	},

	_getServicePath: function(namespace, isComponent) {
		var base = 'src/client/app/' + (isComponent ? 'components' : 'pages') + '/';
		return base + namespace.kebab + '/';
	},

	_createNamespaceDirectory: function(namespace, isComponent) {
		var dirName = this._getServicePath(namespace, isComponent);

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
		tsUtil.addModule(this.fs, 'src/client/app/app.module.ts', 'app.components.' + namespace.kebab);
	},

	_addModule: function(namespace, isComponent) {
		var directoryPath = this._getServicePath(namespace, isComponent);
		var moduleFilepath =  directoryPath + namespace.kebab + '.module.ts';
		this.fs.copyTpl(
			this.templatePath('module.ts'),
			this.destinationPath(moduleFilepath),
			{
				namespace: namespace
			}
		);
	},


	_addService: function(namespace, service, isComponent) {
		var namespacePath = this._getServicePath(namespace, isComponent);
		var controllerFilePath = namespacePath + service.kebab + '.service.ts';
		this.fs.copyTpl(
			this.templatePath('service.ts'),
			this.destinationPath(controllerFilePath),
			{
				namespace: namespace,
				service: service,
				isComponent: isComponent
			}
		);
	},


	writing: function() {
		if (this.props.isNew) {
			this._createNamespaceDirectory(this.props.namespace, this.props.isComponent);
			this._addNamespaceToApplication(this.props.namespace);
			this._addModule(this.props.namespace, this.props.isComponent);
		}

		this._addService(this.props.namespace, this.props.service, this.props.isComponent);
	}

	

});
