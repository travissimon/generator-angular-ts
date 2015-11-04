module.exports = function() {
	var root = '.';
	var src = root + '/src';
	var client = src + '/client';
	var server = src + '/server';
	var clientApp = client + '/app';
	var clientJs = client + '/js';
	var report = './report';
	var specRunnerFile = client + '/specs.html';
	var temp = root + '/.tmp';
	var wiredep = require('wiredep');
	var bowerFiles = wiredep({devDependencies: true})['js'];
	var bower = {
		json: require('./bower.json'),
		directory: './bower_components',
		ignorePath: '../..'
	};
	var nodeModules = 'node_modules';

	var config = {
		/**
		 * File paths
		 */
		allTypeScript: clientApp + '/**/*.ts',
        typings: clientApp + '/typings',
        libraryTypeScriptDefinitions: clientApp + '/typings/**/*.ts',
        appTypeScriptReferences: clientApp + '/typings/app.d.ts',
        tsOutputPath: clientJs,
		// all javascript that we want to vet
		alljs: [
			clientJs + '/**/*.js',
			clientJs + '/*.js'
		],
		build: root + '/build',
		client: client,
		css: clientApp + '/styles/style.css',
		fonts: [
			bower.directory + '/font-awesome/fonts/**/*.*',
			client + '/fonts/*.*'
		],
		html: client + '/**/*.html',
		htmltemplates: clientApp + '/**/*.html',
		images: clientApp + '/images/**/*.*',
		index: client + '/index.html',
		ts: [
			clientApp + '/*.init.ts',
			clientApp + '/**/*.init.ts',
			clientApp + '/**/*.module.ts',
			clientApp + '/**/*.routes.ts',
			clientApp + '/**/*.model.ts',
			clientApp + '/**/*.service.ts',
			clientApp + '/**/*.ts',
			'!' + clientApp + '/**/*.spec.ts'
		],
		tsOrder: [
			clientApp + '/*.init.ts',
			clientApp + '/**/*.init.ts',
			clientApp + '/**/*.module.ts',
			clientApp + '/**/*.routes.ts',
			clientApp + '/**/*.model.ts',
			clientApp + '/**/*.service.ts',
			clientApp + '/**/*.ts'
		],
		// app js, with no specs
		js: [
			clientJs + '/*.init.js',
			clientJs + '/**/*.init.js',
			clientJs + '/**/*.module.js',
			clientJs + '/*.routes.js',
			clientJs + '/**/*.routes.js',
			clientJs + '/**/*.js',
			'!' + clientJs + '/**/*.spec.js'
		],
		jsSpecs: [
			clientJs + '/**/*.spec.js'
		],
		jsOrder: [
			'*.init.js',
			'**/*.init.js',
			'**/*.module.js',
			'**/*.routes.js',
			'**/*.js'
		],
		jsPath: clientJs,
		templatePath: client + '/templates',
		less: clientApp + '/styles/style.less',
		report: report,
		root: root,
		server: server,
		source: 'src',
		stubsjs: [
			bower.directory + '/angular-mocks/angular-mocks.js',
			client + '/stubs/**/*.js'
		],
		temp: temp,

		/**
		 * optimized files
		 */
		optimized: {
			app: 'app.js',
			lib: 'lib.js'
		},

		/**
		 * plato
		 */
		plato: {js: clientJs + '/**/*.js'},

		/**
		 * browser sync
		 */
		browserReloadDelay: 1000,

		/**
		 * template cache
		 */
		templateCache: {
			path: client + '/templates',
			file: 'templates.js',
			options: {
				module: 'app',
				root: 'app/',
				standAlone: false
			}
		},

		/**
		 * Bower and NPM files
		 */
		bower: bower,
		packages: [
			'./package.json',
			'./bower.json'
		],

		/**
		 * specs.html, our HTML spec runner
		 */
		specRunnerFile: specRunnerFile,

		testlibraries: [
			nodeModules + '/karma-jasmine/jasmine.js',
			nodeModules + '/karma-jasmine/boot.js',
			bower.directory + '/angular-mocks/ngMock.js',
			bower.directory + '/angular-mocks/ngAnimateMock.js',
		],
		specHelpers: [client + '/test-helpers/*.js'],
		specs: [clientJs + '/**/*.spec.js'],
		serverIntegrationSpecs: [client + '/tests/server-integration/**/*.spec.js'],

		/**
		 * Node settings
		 */
		nodeServer: './src/server/app.js',
		defaultPort: '8001'
	};

	/**
	 * wiredep and bower settings
	 */
	config.getWiredepDefaultOptions = function() {
		var options = {
			bowerJson: config.bower.json,
			directory: config.bower.directory,
			ignorePath: config.bower.ignorePath
		};
		return options;
	};

	/**
	 * karma settings
	 */
	config.karma = getKarmaOptions();

	return config;

	////////////////

	function getKarmaOptions() {
		var options = {
			files: [].concat(
				bowerFiles,
				config.specHelpers,
				clientJs + '/*.init.js',
				clientJs + '/**/*.init.js',
				clientJs + '/*.module.js',
				clientJs + '/**/*.module.js',
				clientJs + '/**/*.routes.js',
				clientJs + '/**/*.model.js',
				clientJs + '/**/*.service.js',
				clientJs + '/**/*.js',
 				config.templateCache.path + '/' + config.templateCache.file,
				config.serverIntegrationSpecs
			),
			exclude: [],
			coverage: {
				dir: report + '/coverage',
				reporters: [
					// reporters not supporting the `file` property
					{type: 'html', subdir: 'report-html'},
					{type: 'lcov', subdir: 'report-lcov'},
					{type: 'text-summary'} //, subdir: '.', file: 'text-summary.txt'}
				]
			},
			preprocessors: {}
		};
		options.preprocessors[clientJs + '/**/!(*.spec)+(.js)'] = ['coverage'];
		return options;
	}
};
