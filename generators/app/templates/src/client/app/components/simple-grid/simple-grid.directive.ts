/// <reference path="../../typings/app.d.ts" />

module app.components.simpleGrid {
    'use strict';

	class SimpleGridDirective implements ng.IDirective {
		bindToController: boolean = false;
		controller: string = 'SimpleGridController';
		scope = {
			rows: '=',
			columnDefinitions: '=',
			selected: '&',
		};
		restrict: string = 'EA';
		templateUrl: string = 'app/components/simple-grid/simple-grid.template.html';
		link = (scope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: SimpleGridController) => {
			ctrl.setTableReference(element.find('table').first());
			scope.$watch('rows', function(newVal){
				ctrl.setData(newVal);
			});
			scope.$watch('columnDefinitions', function(newVal){
				ctrl.setColumnDefinitions(newVal);
			});
			scope.$watch(attrs['selectRows'], function(newVal) {
				if (!angular.isDefined(newVal) || newVal === null || newVal.length === 0) {
					return;
				}
				ctrl.selectRows = newVal;
			});
			if (attrs['class'] != null) {
				element.children().first().addClass(attrs['class']);
			}
			if (attrs['sortCol'] != null) {
				var colStr = attrs['sortCol'];
				ctrl.setSortColumn(parseInt(colStr));
			}
			if (attrs['sortDirection'] != null) {
				ctrl.setSortDirection(attrs['sortDirection']);
			}
			ctrl.setData(scope.rows);
			ctrl.setColumnDefinitions(scope.columnDefinitions);
			ctrl.drawTable();
		};

		constructor(private $log: ng.ILogService) {
		}


		static factory(): ng.IDirectiveFactory {
			var directive = ($log: ng.ILogService) => {
				return new SimpleGridDirective($log);
			};

			directive.$inject = ['$log'];

			return directive;
		}

	}

	app.Module.load('app.components.simpleGrid').addDirective('simpleGrid', SimpleGridDirective.factory());
}
