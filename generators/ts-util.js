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

	// handles text arrays only
	_convertArrayNode(arrayNode) {
		var vals = [];
		for (var i = 0; i < arrayNode.elements.length; i++) {
			var el = arrayNode.elements[i];
			if (el == null || el.elements == null) {
				continue;
			} else {
				vals.push(arrayNode.elements[i].text);
			}
		}
		
		return vals;
	},

	// convert JS array to code string in a formatting-friendly
	// manner (i.e. one entry per line)
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
		var arrayNode = this._findRoutesArray(sourceFile, sourceFile);
		var arr = JSON.parse(arrayNode.getText(sourceFile));
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].name === routeName) {
				console.log(chalk.yellow('Route \'' + routeName + '\' already exists -- skipping'));
				return;
			}
		}

		arr.push({
			name: routeName.original,
			url: route,
			controller: controller,
			controllerAs: 'vm',
			templateUrl: templateUrl
		});

		// recreate JS array
		var newArr = this._arrayToCode(arr);

		// replace current array with new content
		var head = contents.substring(0, arrayNode.pos);
		var tail = contents.substring(arrayNode.end + 1);
		var newContent = head + newArr + tail;

		// format our modified code
		newContent = this._formatTypescript(newContent);

		console.log(newContent);
		fs.write(filePath, newContent);
	},

	logLvl: function(lvl, desc) {
		var indent = '..'.repeat(lvl);
		console.log(indent + desc);		
	},

	printNode: function(node, lvl) {
		if (lvl == null) {
			lvl = 0;
		}

		if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
			console.log('obj');
			console.dir(node);
		}

		var desc = this.getKindString(node);
		this.logLvl(lvl, desc);
		
		var children = node.getChildren();
		if (children != null && children.length > 0) {
			for (var i = 0; i < children.length; i++) {
				this.printNode(children[i], lvl + 1);
			}
		}

	},

	getKindString: function(node) {
		switch (node.kind) {
		case ts.SyntaxKind.Unknown:
		case ts.SyntaxKind.EndOfFileToken:
		case ts.SyntaxKind.SingleLineCommentTrivia:
		case ts.SyntaxKind.MultiLineCommentTrivia:
		case ts.SyntaxKind.NewLineTrivia:
		case ts.SyntaxKind.WhitespaceTrivia:
        // We detect and preserve #! on the first line
		case ts.SyntaxKind.ShebangTrivia:
        // We detect and provide better error recovery when we encounter a git merge marker.  This
        // allows us to edit files with git-conflict markers in them in a much more pleasant manner.
		case ts.SyntaxKind.ConflictMarkerTrivia:
			return 'trivia';
        // Literals
		case ts.SyntaxKind.NumericLiteral:
		case ts.SyntaxKind.StringLiteral:
		case ts.SyntaxKind.RegularExpressionLiteral:
		case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
			return 'literal';
        // Pseudo-literals
		case ts.SyntaxKind.TemplateHead:
		case ts.SyntaxKind.TemplateMiddle:
		case ts.SyntaxKind.TemplateTail:
			return 'psueo-literal';
        // Punctuation
		case ts.SyntaxKind.OpenBraceToken:
		case ts.SyntaxKind.CloseBraceToken:
		case ts.SyntaxKind.OpenParenToken:
		case ts.SyntaxKind.CloseParenToken:
		case ts.SyntaxKind.OpenBracketToken:
		case ts.SyntaxKind.CloseBracketToken:
		case ts.SyntaxKind.DotToken:
		case ts.SyntaxKind.DotDotDotToken:
		case ts.SyntaxKind.SemicolonToken:
		case ts.SyntaxKind.CommaToken:
		case ts.SyntaxKind.LessThanToken:
		case ts.SyntaxKind.LessThanSlashToken:
		case ts.SyntaxKind.GreaterThanToken:
		case ts.SyntaxKind.LessThanEqualsToken:
		case ts.SyntaxKind.GreaterThanEqualsToken:
		case ts.SyntaxKind.EqualsEqualsToken:
		case ts.SyntaxKind.ExclamationEqualsToken:
		case ts.SyntaxKind.EqualsEqualsEqualsToken:
		case ts.SyntaxKind.ExclamationEqualsEqualsToken:
		case ts.SyntaxKind.EqualsGreaterThanToken:
		case ts.SyntaxKind.PlusToken:
		case ts.SyntaxKind.MinusToken:
		case ts.SyntaxKind.AsteriskToken:
		case ts.SyntaxKind.AsteriskAsteriskToken:
		case ts.SyntaxKind.SlashToken:
		case ts.SyntaxKind.PercentToken:
		case ts.SyntaxKind.PlusPlusToken:
		case ts.SyntaxKind.MinusMinusToken:
		case ts.SyntaxKind.LessThanLessThanToken:
		case ts.SyntaxKind.GreaterThanGreaterThanToken:
		case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
		case ts.SyntaxKind.AmpersandToken:
		case ts.SyntaxKind.BarToken:
		case ts.SyntaxKind.CaretToken:
		case ts.SyntaxKind.ExclamationToken:
		case ts.SyntaxKind.TildeToken:
		case ts.SyntaxKind.AmpersandAmpersandToken:
		case ts.SyntaxKind.BarBarToken:
		case ts.SyntaxKind.QuestionToken:
		case ts.SyntaxKind.ColonToken:
		case ts.SyntaxKind.AtToken:
			return 'punctuation';

		case ts.SyntaxKind.EqualsToken:
		case ts.SyntaxKind.PlusEqualsToken:
		case ts.SyntaxKind.MinusEqualsToken:
		case ts.SyntaxKind.AsteriskEqualsToken:
		case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
		case ts.SyntaxKind.SlashEqualsToken:
		case ts.SyntaxKind.PercentEqualsToken:
		case ts.SyntaxKind.LessThanLessThanEqualsToken:
		case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
		case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
		case ts.SyntaxKind.AmpersandEqualsToken:
		case ts.SyntaxKind.BarEqualsToken:
		case ts.SyntaxKind.CaretEqualsToken:
			return 'assignment';
        // Identifiers
		case ts.SyntaxKind.Identifier:
			return 'identifier';
        // Reserved words
		case ts.SyntaxKind.BreakKeyword:
		case ts.SyntaxKind.CaseKeyword:
		case ts.SyntaxKind.CatchKeyword:
		case ts.SyntaxKind.ClassKeyword:
		case ts.SyntaxKind.ConstKeyword:
		case ts.SyntaxKind.ContinueKeyword:
		case ts.SyntaxKind.DebuggerKeyword:
		case ts.SyntaxKind.DefaultKeyword:
		case ts.SyntaxKind.DeleteKeyword:
		case ts.SyntaxKind.DoKeyword:
		case ts.SyntaxKind.ElseKeyword:
		case ts.SyntaxKind.EnumKeyword:
		case ts.SyntaxKind.ExportKeyword:
		case ts.SyntaxKind.ExtendsKeyword:
		case ts.SyntaxKind.FalseKeyword:
		case ts.SyntaxKind.FinallyKeyword:
		case ts.SyntaxKind.ForKeyword:
		case ts.SyntaxKind.FunctionKeyword:
		case ts.SyntaxKind.IfKeyword:
		case ts.SyntaxKind.ImportKeyword:
		case ts.SyntaxKind.InKeyword:
		case ts.SyntaxKind.InstanceOfKeyword:
		case ts.SyntaxKind.NewKeyword:
		case ts.SyntaxKind.NullKeyword:
		case ts.SyntaxKind.ReturnKeyword:
		case ts.SyntaxKind.SuperKeyword:
		case ts.SyntaxKind.SwitchKeyword:
		case ts.SyntaxKind.ThisKeyword:
		case ts.SyntaxKind.ThrowKeyword:
		case ts.SyntaxKind.TrueKeyword:
		case ts.SyntaxKind.TryKeyword:
		case ts.SyntaxKind.TypeOfKeyword:
		case ts.SyntaxKind.VarKeyword:
		case ts.SyntaxKind.VoidKeyword:
		case ts.SyntaxKind.WhileKeyword:
		case ts.SyntaxKind.WithKeyword:
			return 'reserved';
        // Strict mode reserved words
		case ts.SyntaxKind.ImplementsKeyword:
		case ts.SyntaxKind.InterfaceKeyword:
		case ts.SyntaxKind.LetKeyword:
		case ts.SyntaxKind.PackageKeyword:
		case ts.SyntaxKind.PrivateKeyword:
		case ts.SyntaxKind.ProtectedKeyword:
		case ts.SyntaxKind.PublicKeyword:
		case ts.SyntaxKind.StaticKeyword:
		case ts.SyntaxKind.YieldKeyword:
			return 'strict reserved';
        // Contextual keywords
		case ts.SyntaxKind.AbstractKeyword:
		case ts.SyntaxKind.AsKeyword:
		case ts.SyntaxKind.AnyKeyword:
		case ts.SyntaxKind.AsyncKeyword:
		case ts.SyntaxKind.AwaitKeyword:
		case ts.SyntaxKind.BooleanKeyword:
		case ts.SyntaxKind.ConstructorKeyword:
		case ts.SyntaxKind.DeclareKeyword:
		case ts.SyntaxKind.GetKeyword:
		case ts.SyntaxKind.IsKeyword:
		case ts.SyntaxKind.ModuleKeyword:
		case ts.SyntaxKind.NamespaceKeyword:
		case ts.SyntaxKind.ReadonlyKeyword:
		case ts.SyntaxKind.RequireKeyword:
		case ts.SyntaxKind.NumberKeyword:
		case ts.SyntaxKind.SetKeyword:
		case ts.SyntaxKind.StringKeyword:
		case ts.SyntaxKind.SymbolKeyword:
		case ts.SyntaxKind.TypeKeyword:
		case ts.SyntaxKind.FromKeyword:
		case ts.SyntaxKind.GlobalKeyword:
		case ts.SyntaxKind.OfKeyword:
			return 'contextual keywords';

		// LastKeyword and LastToken

        // Parse tree nodes

        // Names
		case ts.SyntaxKind.QualifiedName:
		case ts.SyntaxKind.ComputedPropertyName:
			return 'names';
        // Signature elements
		case ts.SyntaxKind.TypeParameter:
		case ts.SyntaxKind.Parameter:
		case ts.SyntaxKind.Decorator:
			return 'sig';
        // TypeMember
		case ts.SyntaxKind.PropertySignature:
		case ts.SyntaxKind.PropertyDeclaration:
		case ts.SyntaxKind.MethodSignature:
		case ts.SyntaxKind.MethodDeclaration:
		case ts.SyntaxKind.Constructor:
		case ts.SyntaxKind.GetAccessor:
		case ts.SyntaxKind.SetAccessor:
		case ts.SyntaxKind.CallSignature:
		case ts.SyntaxKind.ConstructSignature:
		case ts.SyntaxKind.IndexSignature:
			return 'type member';

		case ts.SyntaxKind.TypePredicate:
		case ts.SyntaxKind.TypeReference:
		case ts.SyntaxKind.FunctionType:
		case ts.SyntaxKind.ConstructorType:
		case ts.SyntaxKind.TypeQuery:
		case ts.SyntaxKind.TypeLiteral:
		case ts.SyntaxKind.ArrayType:
		case ts.SyntaxKind.TupleType:
		case ts.SyntaxKind.UnionType:
		case ts.SyntaxKind.IntersectionType:
		case ts.SyntaxKind.ParenthesizedType:
		case ts.SyntaxKind.ThisType:
		case ts.SyntaxKind.StringLiteralType:
			return 'type';
        // Binding patterns
		case ts.SyntaxKind.ObjectBindingPattern:
		case ts.SyntaxKind.ArrayBindingPattern:
		case ts.SyntaxKind.BindingElement:
			return 'binding';
        // Expression
		case ts.SyntaxKind.ArrayLiteralExpression:
			return 'array literal';
		case ts.SyntaxKind.ObjectLiteralExpression:
			return 'object literal';
		case ts.SyntaxKind.PropertyAccessExpression:
		case ts.SyntaxKind.ElementAccessExpression:
		case ts.SyntaxKind.CallExpression:
		case ts.SyntaxKind.NewExpression:
		case ts.SyntaxKind.TaggedTemplateExpression:
		case ts.SyntaxKind.TypeAssertionExpression:
		case ts.SyntaxKind.ParenthesizedExpression:
		case ts.SyntaxKind.FunctionExpression:
		case ts.SyntaxKind.ArrowFunction:
		case ts.SyntaxKind.DeleteExpression:
		case ts.SyntaxKind.TypeOfExpression:
		case ts.SyntaxKind.VoidExpression:
		case ts.SyntaxKind.AwaitExpression:
		case ts.SyntaxKind.PrefixUnaryExpression:
		case ts.SyntaxKind.PostfixUnaryExpression:
		case ts.SyntaxKind.BinaryExpression:
		case ts.SyntaxKind.ConditionalExpression:
		case ts.SyntaxKind.TemplateExpression:
		case ts.SyntaxKind.YieldExpression:
		case ts.SyntaxKind.SpreadElementExpression:
		case ts.SyntaxKind.ClassExpression:
		case ts.SyntaxKind.OmittedExpression:
		case ts.SyntaxKind.ExpressionWithTypeArguments:
		case ts.SyntaxKind.AsExpression:
			return 'expression';

        // Misc
		case ts.SyntaxKind.TemplateSpan:
		case ts.SyntaxKind.SemicolonClassElement:
			return 'misc';
			
        // Element
		case ts.SyntaxKind.Block:
		case ts.SyntaxKind.VariableStatement:
		case ts.SyntaxKind.EmptyStatement:
		case ts.SyntaxKind.ExpressionStatement:
		case ts.SyntaxKind.IfStatement:
		case ts.SyntaxKind.DoStatement:
		case ts.SyntaxKind.WhileStatement:
		case ts.SyntaxKind.ForStatement:
		case ts.SyntaxKind.ForInStatement:
		case ts.SyntaxKind.ForOfStatement:
		case ts.SyntaxKind.ContinueStatement:
		case ts.SyntaxKind.BreakStatement:
		case ts.SyntaxKind.ReturnStatement:
		case ts.SyntaxKind.WithStatement:
		case ts.SyntaxKind.SwitchStatement:
		case ts.SyntaxKind.LabeledStatement:
		case ts.SyntaxKind.ThrowStatement:
		case ts.SyntaxKind.TryStatement:
		case ts.SyntaxKind.DebuggerStatement:
		case ts.SyntaxKind.VariableDeclaration:
		case ts.SyntaxKind.VariableDeclarationList:
		case ts.SyntaxKind.FunctionDeclaration:
		case ts.SyntaxKind.ClassDeclaration:
		case ts.SyntaxKind.InterfaceDeclaration:
		case ts.SyntaxKind.TypeAliasDeclaration:
		case ts.SyntaxKind.EnumDeclaration:
		case ts.SyntaxKind.ModuleDeclaration:
		case ts.SyntaxKind.ModuleBlock:
		case ts.SyntaxKind.CaseBlock:
		case ts.SyntaxKind.ImportEqualsDeclaration:
		case ts.SyntaxKind.ImportDeclaration:
		case ts.SyntaxKind.ImportClause:
		case ts.SyntaxKind.NamespaceImport:
		case ts.SyntaxKind.NamedImports:
		case ts.SyntaxKind.ImportSpecifier:
		case ts.SyntaxKind.ExportAssignment:
		case ts.SyntaxKind.ExportDeclaration:
		case ts.SyntaxKind.NamedExports:
		case ts.SyntaxKind.ExportSpecifier:
		case ts.SyntaxKind.MissingDeclaration:
			return 'element';

        // Module references
		case ts.SyntaxKind.ExternalModuleReference:
			return 'module';

        // JSX
		case ts.SyntaxKind.JsxElement:
		case ts.SyntaxKind.JsxSelfClosingElement:
		case ts.SyntaxKind.JsxOpeningElement:
		case ts.SyntaxKind.JsxText:
		case ts.SyntaxKind.JsxClosingElement:
		case ts.SyntaxKind.JsxAttribute:
		case ts.SyntaxKind.JsxSpreadAttribute:
		case ts.SyntaxKind.JsxExpression:
			return 'jsx';

        // Clauses
		case ts.SyntaxKind.CaseClause:
		case ts.SyntaxKind.DefaultClause:
		case ts.SyntaxKind.HeritageClause:
		case ts.SyntaxKind.CatchClause:
			return 'clauses';

        // Property assignments
		case ts.SyntaxKind.PropertyAssignment:
		case ts.SyntaxKind.ShorthandPropertyAssignment:
			return 'prop assign';

        // Enum
		case ts.SyntaxKind.EnumMember:
			return 'enum';
        // Top-level nodes
		case ts.SyntaxKind.SourceFile:
			return 'source file';

        // JSDoc nodes
		case ts.SyntaxKind.JSDocTypeExpression:
        // The * type
		case ts.SyntaxKind.JSDocAllType:
        // The ? type
		case ts.SyntaxKind.JSDocUnknownType:
		case ts.SyntaxKind.JSDocArrayType:
		case ts.SyntaxKind.JSDocUnionType:
		case ts.SyntaxKind.JSDocTupleType:
		case ts.SyntaxKind.JSDocNullableType:
		case ts.SyntaxKind.JSDocNonNullableType:
		case ts.SyntaxKind.JSDocRecordType:
		case ts.SyntaxKind.JSDocRecordMember:
		case ts.SyntaxKind.JSDocTypeReference:
		case ts.SyntaxKind.JSDocOptionalType:
		case ts.SyntaxKind.JSDocFunctionType:
		case ts.SyntaxKind.JSDocVariadicType:
		case ts.SyntaxKind.JSDocConstructorType:
		case ts.SyntaxKind.JSDocThisType:
		case ts.SyntaxKind.JSDocComment:
		case ts.SyntaxKind.JSDocTag:
		case ts.SyntaxKind.JSDocParameterTag:
		case ts.SyntaxKind.JSDocReturnTag:
		case ts.SyntaxKind.JSDocTypeTag:
		case ts.SyntaxKind.JSDocTemplateTag:
			return 'jsdoc';

        // Synthesized list
		case ts.SyntaxKind.SyntaxList:
			return 'syntax list';

        // Enum value count
		case ts.SyntaxKind.Count:
			return 'count';
		}

		return 'unknown';
    }

	
};
