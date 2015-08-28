(function() {
	'use strict';

	describe('Directive Controller: simple-grid', function () {
		var testData = [{
				id: 1,
				name: 'c item'
			}, {
				id: 2,
				name: 'a item'
			}, {
				id: 3,
				name: 'd item'
			}, {
				id: 4,
				name: 'b item'
			},
		];

		// load the directive's module
		beforeEach(angular.mock.module('app.components.simpleGrid'));

		var controller,
		scope;

		var filterText = null;
		var field = 'id';
		var sortAsc = true;
		var pageSize = 5;
		var pg = 1;

		beforeEach(inject(function ($rootScope, $controller) {
			scope = $rootScope.$new();
			controller = $controller('SimpleGridController', {$scope: scope});

			filterText = null;
			field = 'id',
			sortAsc = true;
			pageSize = 5;
			pg = 1
		}));

		it('should accept in-memory data collections', function () {
			expect(controller).toBeDefined();
			controller.setData(testData);
			expect(controller.dataRows.length).toEqual(4);
		});

		function compareResultsToExpectedIds(results, ids) {
			expect(results.totalItems).toEqual(ids.length);
			for (var i=0; i < results.rows.length; i++) {
				expect(results.rows[i].id).toEqual(ids[i]);
			}
		}

		describe('InMemoryRetreiver', function() {
			it('should sort by id asc', function () {
				controller.setData(testData);
				var results = controller.dataRetreiver.getDataSync(filterText, field, sortAsc, pageSize, pg);
				var exp = [1, 2, 3, 4];
				compareResultsToExpectedIds(results, exp);
			});

			it('should sort by id desc', function () {
				controller.setData(testData);
				sortAsc = false;
				var results = controller.dataRetreiver.getDataSync(filterText, field, sortAsc, pageSize, pg);
				var exp = [4, 3, 2, 1];
				compareResultsToExpectedIds(results, exp);
			});

			it('should sort by name asc', function () {
				controller.setData(testData);
				field = 'name';
				var results = controller.dataRetreiver.getDataSync(filterText, field, sortAsc, pageSize, pg);
				var exp = [2, 4, 1, 3];
				compareResultsToExpectedIds(results, exp);
			});

			it('should sort by name desc', function () {
				controller.setData(testData);
				field = 'name';
				sortAsc = false
				var results = controller.dataRetreiver.getDataSync(filterText, field, sortAsc, pageSize, pg);
				var exp = [3, 1, 4, 2];
				compareResultsToExpectedIds(results, exp);
			});

		});

});})();
