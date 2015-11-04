'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var ts = require('typescript');
var _ = require('lodash');
var createCompounder = require('lodash/internal/createCompounder');

module.exports = {

	capitalCase: createCompounder(function(result, word, index) {
		word = word.toLowerCase();
		return result + word.charAt(0).toUpperCase() + word.slice(1);
	}),

	// returns various casings
	getCases: function(val) {
		return {
			original: val,
			capital: this.capitalCase(val),
			camel: _.camelCase(val),
			kebab: _.kebabCase(val),
			snake: _.snakeCase(val)
		};
	},

	_getRuleProvider: function(options) {
		// Share this between multiple formatters using the same options.
		// This represents the bulk of the space the formatter uses.
		var ruleProvider = new ts.formatting.RulesProvider();
		ruleProvider.ensureUpToDate(options);
		return ruleProvider;
	},

	_applyEdits: function(text, edits) {
		// Apply edits in reverse on the existing text
		var result = text;
		for (var i = edits.length - 1; i >= 0; i--) {
			var change = edits[i];
			var head = result.slice(0, change.span.start);
			var tail = result.slice(change.span.start + change.span.length);
			result = head + change.newText + tail;
		}
		return result;
	},

	_getDefaultOptions: function() {
		return {
			IndentSize: 4,
			TabSize: 4,
			NewLineCharacter: '\n',
			ConvertTabsToSpaces: false,
			InsertSpaceAfterCommaDelimiter: true,
			InsertSpaceAfterSemicolonInForStatements: true,
			InsertSpaceBeforeAndAfterBinaryOperators: true,
			InsertSpaceAfterKeywordsInControlFlowStatements: true,
			InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
			InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
			PlaceOpenBraceOnNewLineForFunctions: false,
			PlaceOpenBraceOnNewLineForControlBlocks: false
		};
	},

	_formatTypescript: function(text) {
		var options = this._getDefaultOptions();

		// Parse the source text
		var sourceFile = ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest, true);

		// Get the formatting edits on the input sources
		var ruleProvider = this._getRuleProvider(options);
		var edits = ts.formatting.formatDocument(sourceFile, ruleProvider, options);

		// Apply the edits on the input code
		return this._applyEdits(text, edits);
	},

	_findRoutesArray: function(node) {
		if (node.kind === ts.SyntaxKind.ArrayLiteralExpression &&
		   node.parent.kind === ts.SyntaxKind.ReturnStatement) {
			return node;
		}
		
		var children = node.getChildren();
		for (var i = 0; i < children.length; i++) {
			var childNode = this._findRoutesArray(children[i]);
			if (childNode != null) {
				return childNode;
			}
		}

		return null;
	},

	_findFirstArray: function(sourceFile) {
		function findInNode(node) {
			if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
				return node;
			}
			var children = node.getChildren();
			for (var i = 0; i < children.length; i++) {
				var result = findInNode(children[i]);
				if (result != null) {
					return result;
				}
			}

			return null;
		}

		return findInNode(sourceFile);
	},

	_convertArrayNode(arrayNode) {
		var vals = [];
		for (var i = 0; i < arrayNode.elements.length; i++) {
			vals.push(arrayNode.elements[i].text);
		}
		
		return vals;
	},

	// convert JS array to code string in a formatting-friendly
	// mannor (i.e. one entry per line)
	_arrayToCode(array) {
		var newArr = '[\n';
		for (var i = 0; i < array.length; i++) {
			if (i > 0) {
				newArr += ',\n';
			}
			newArr += JSON.stringify(array[i], null, '\t');
		}
		newArr += '\n]';
		return newArr;
	},

	addModule: function(fs, filePath, moduleName) {
		var contents = fs.read(filePath, 'utf-8');
		var sourceFile = ts.createSourceFile('file.ts', contents, ts.ScriptTarget.Latest, true);

		// find the array contents
		var arrayNode = this._findFirstArray(sourceFile);

		// convert it into useable strings
		var vals = this._convertArrayNode(arrayNode);
		if (vals.indexOf(moduleName) > 0) {
			console.log(chalk.yellow(filePath + ' already contains the module \'' + moduleName + '\' - skipping file'));
			return;
		}

		// add our value
		vals.push(moduleName);
		vals.sort();

		// recreate JS array
		var newArr = this._arrayToCode(vals);

		// replace current array with new content
		var head = contents.substring(0, arrayNode.pos);
		var tail = contents.substring(arrayNode.end + 1);
		var newContent = head + newArr + tail;

		// format our modified code
		newContent = this._formatTypescript(newContent);

		fs.write(filePath, newContent);
	},

	addRoute: function(fs, filePath, routeName, route, controller, templateUrl) {
		var contents = fs.read(filePath);
		var sourceFile = ts.createSourceFile('file.ts', contents, ts.ScriptTarget.Latest, true);

		// find the array contents
		var arrayNode = this._findRoutesArray(sourceFile);

		var vals = this._convertArrayNode(arrayNode);
		for (var i = 0; i < vals.length; i++) {
			if (vals[i].name === routeName) {
				console.log(chalk.yellow('Route \'' + routeName + '\' already exists -- skipping'));
				return;
			}
		}

		console.log('Controller and templateUrl:');
		console.log(controller);
		console.log(templateUrl);

		vals.push({
			name: routeName.original,
			url: route,
			controller: controller,
			controllerAs: 'vm',
			templateUrl: templateUrl
		});

		// recreate JS array
		var newArr = this._arrayToCode(vals);

		// replace current array with new content
		var head = contents.substring(0, arrayNode.pos);
		var tail = contents.substring(arrayNode.end + 1);
		var newContent = head + newArr + tail;

		// format our modified code
		newContent = this._formatTypescript(newContent);

		// console.log(newContent);
		fs.write(filePath, newContent);
	}

};
