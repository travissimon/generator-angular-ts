/// <reference path="typings/app.d.ts" />

module app {

	// Utility Module class for streamlining angular module/route creation
	export class Module {
		public angularModule: ng.IModule;
		
		constructor(name: string, modules?: string[]) {
			if (modules == null) {
				this.angularModule = angular.module(name);
			} else {
				this.angularModule = angular.module(name, modules);
			}
		}

		static create(name: string, modules: string[]) : Module {
			return new Module(name, modules);
		}

		static load(name: string): Module {
			return new Module(name);
		}

		addController(name: string, controller: Function): Module {
			this.angularModule.controller(name, controller);
			return this;
		}

		addFactory(name: string, factory: Function): Module {
			this.angularModule.factory(name, factory);
			return this;
		}

		addService(name: string, service: Function): Module {
			this.angularModule.service(name, service);
			return this;
		}

		addDirective(name: string, directive: ng.IDirectiveFactory): Module {
			this.angularModule.directive(name, directive);
			return this;
		}

		addProvider(name: string, provider: ng.IServiceProvider): Module {
			this.angularModule.provider(name, provider);
			return this;
		}

		config(configBlock: Function): Module {
			this.angularModule.config(configBlock);
			return this;
		}

		run(runBlock: Function): Module {
			this.angularModule.run(runBlock);
			return this;
		}
	}
}

// Monkey-patch useful methods onto String & Array classes

var nullOrEmptyFn = function(obj: {length: number}): boolean {
	return obj == null || obj.length == null || obj.length === 0;
};

interface ArrayConstructor {
	nullOrEmpty(obj: any): boolean;
}

Array.nullOrEmpty = nullOrEmptyFn;

/*
interface Array {
	contains(obj: any): boolean;
}

Array.prototype.contains = function(obj: any): boolean {
	return Array.prototype.indexOf.apply(this, arguments) !== -1;
}
*/

interface StringConstructor {
	nullOrEmpty(s: string): boolean;
}

String.nullOrEmpty = nullOrEmptyFn;

interface String {
	startsWith(s: string): boolean;
	endsWith(s: string): boolean;
	contains(s: string): boolean;
	hashCode(): number;
}


String.prototype.contains = function(s: string): boolean {
	return String.prototype.indexOf.apply(this, arguments) !== -1;
}

String.prototype.startsWith = function(prefix: string): boolean {
	return this.indexOf(prefix, 0) === 0;
}

String.prototype.endsWith = function(suffix: string): boolean {
	if (this == null || this.length === 0 || suffix == null || suffix.length === 0)
		return false;
	return this.indexOf(suffix, this.length - suffix.length) === 0;
};


if (!String.prototype.contains) {
	String.prototype.contains = function() {
		return String.prototype.indexOf.apply( this, arguments ) !== -1;
	};
}

// quick hashCode method for String
String.prototype.hashCode = function(): number {
	var hash = 0, chr, i, len;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

interface Node {
	contains(el: Node): boolean;
}

// Wow. Apparently Phantom JS's defininition for a dom's Node object
// does not contain an implementation for contains(). So, define it here . . .
if (!Node.prototype.contains) {
	Node.prototype.contains = function(el: Node): boolean {
		while (el != null) {
			if (el === this) {
				return true;
			}
			el = el.parentNode;
		}
		return false;
	};
}
