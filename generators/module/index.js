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

		this.argument('moduleName', {
			type: String,
			desc: 'The name of the module you wish to create.',
			required: true
		});

		this.argument('filePath', {
			type: String,
			desc: 'The path to the file where the module is to be added',
			required: true
		});
	},


	writing: {

		addModule: function() {
			tsUtil.addModule(this.fs, this.filePath, this.moduleName);
		}

		
	}

});
