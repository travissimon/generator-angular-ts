/// <reference path="../../typings/app.d.ts" />

module app.components.simpleGrid {
	'use strict';

	export class InMemoryRetreiver implements IDataRetreiver {

		private originalData: any[];
		private orderBy: any;
		
		constructor(dataArray: any[], private $filter, private $q) {
			this.originalData = dataArray;
			this.orderBy = $filter('orderBy');
		}


		// This is the synchronous code that we use to retreive data.
		// It is separated to facilitate testing.
		public getDataSync(filterText: string, sortField: string, isAscending: boolean, pageSize: number, pageToRetreive: number): IDataResponse {
			var dataRows = this.filterData(this.originalData, filterText);
			dataRows = this.sortData(dataRows, sortField, isAscending);

			var returnData = [];
			var startPos = this.getAbsolutePos(pageToRetreive, pageSize, 0);
			for (var i=startPos; i < (pageSize + startPos) && i < dataRows.length; i++) {
				returnData.push(dataRows[i]);
			}

			var response = {
				rows: returnData,
				currentPage: pageToRetreive,
				totalItems: dataRows.length
			};
			return response;
		}

		public filterData(dataRows: any[], filterText: string): any[] {
			if (String.nullOrEmpty(filterText)) {
				return dataRows;
			}
			return this.$filter('filter')(this.originalData, filterText);
		}

		public sortData = function(dataRows: any[], fieldname: string, isAscending: boolean): any[] {
			// final parameter is 'reverse', which is opposite to isAscending
			return this.orderBy(dataRows, fieldname, !isAscending);
		}

		public getAbsolutePos(currentPage: number, pageSize: number, offset: number): number {
			return ((currentPage - 1) * pageSize) + offset;
		}

		public getData(filterText: string, sortField: string, isAscending: boolean, pageSize: number, pageToRetreive: number): ng.IPromise<IDataResponse> {
			var deferred = this.$q.defer();
			var self = this;

			// we have to call this async to match the behaviour of an ajax-based call
			setTimeout(function() {
				var res = self.getDataSync(filterText, sortField, isAscending, pageSize, pageToRetreive);
				deferred.resolve(res);
			}, 1);

			return deferred.promise;
		}
	}
}
