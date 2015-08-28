/// <reference path="../../typings/app.d.ts" />

module app.components.simpleGrid {
	'use strict';

	export interface SimpleGridScope extends ng.IScope {
		vm: SimpleGridController;
	}

	interface rowReference {
		row: JQuery;
		cols: JQuery[];
	}


	export class SimpleGridController {

		static $inject = ['$log', '$scope', '$filter', '$timeout', '$q', '$compile'];
		constructor(private $log: ng.ILogService, private $scope: SimpleGridScope, private $filter: ng.IFilterService, private $timeout: ng.ITimeoutService, private $q: ng.IQService, private $compile: ng.ICompileService) {
			this.$scope.vm = this;
			this.createWatches();
		}

		public pageSizeOptions: number[] = [15, 20, 25, 50, 100];
		public pageSize: number = 25;
		public currentPage: number = 1;
		public searchPlaceholder: string = 'Search';
		public filterText: string = '';
		public totalItems: number = 0;
		public selectRows: boolean = true;
		public selectedItems: any[];

		private tableReference: JQuery = null;
		private tbodyReference: JQuery = null;
		private theadReference: JQuery = null;
		private tfootReference: JQuery = null;
		private columnDefinitions = [];
		private originalData: any[] = [];
		private dataRows: any[] = [];
		private domRows: rowReference[] = [];
		private removedDomRows: rowReference[] = [];
		private sortColumn: number = 0;
		private sortAscending: boolean = true;

		private filterPromise: ng.IPromise<any> = null;

		// data retreival strategy
		private dataRetreiver: IDataRetreiver = null;

		// init - watch for changes in pagesize, filter text and current page
		private createWatches(): void {
			var self = this;

			this.$scope.$watch(function() {
				return this.pageSize;
			}, function(newVal) {
				if (newVal) {
					self.drawTable();
				}
			});

			this.$scope.$watch(function() {
				return this.currentPage;
			}, function(newVal) {
				if (newVal) {
					self.updateRows();
				}
			});

			this.$scope.$watch(function() {
				return this.filterText;
			}, function(newVal) {
				if (self.filterPromise != null) {
					self.$timeout.cancel(self.filterPromise);
				}
				self.filterPromise = self.$timeout(self.applyFilter, 10);
			});
		}

		// sets the data - used when we are handling data in memory
		public setData(dataRows: any[]): void {
			this.originalData = dataRows;
			this.dataRows = this.originalData;
			this.dataRetreiver = new InMemoryRetreiver(this.dataRows, this.$filter, this.$q);
			this.updateRows();
		}

		public applyFilter(): void {
			this.updateRows();
		}

		// reference to our ui elements
		public setTableReference(tbl: JQuery): void {
			this.tableReference = tbl;
			this.theadReference = tbl.children('thead').first();
			this.tbodyReference = tbl.children('tbody').first();
			this.tfootReference = tbl.children('tfoot').first();
		}

		public setColumnDefinitions(definitions): void {
			this.columnDefinitions = definitions;
			this.drawTable();
		}

		public setSortColumn(col): void {
			this.sortColumn = col;
		}


		public setSortDirection(direction: string): void {
			var lower = direction.toLowerCase();
			this.sortAscending = (lower.startsWith('asc'));
		}

		// renders the entire table.
		public drawTable(): void {
			if (this.dataRows == null) {
				return;
			}

			if (this.tableReference == null) {
				return;
			}

			if (this.domRows.length !== this.pageSize) {
				this.domRows = [];
				this.drawHeaderAndFooter();
				this.preDrawDomRows();
			}

			this.updateRows();
		}


		// pg is 1 based, offset is 0 based
		private getAbsolutePos(offset: number): number {
			return ((this.currentPage - 1) * this.pageSize) + offset;
		}

		// toggles sorting on a specific column
		public toggleSort(hdrItem: HTMLElement) {
			var hdrText = hdrItem.innerText.trim();
			var idx = this.getColumnIndexByHeader(hdrText);
			if (idx === this.sortColumn) {
				this.sortAscending = !this.sortAscending;
			} else {
				this.sortColumn = idx;
				this.sortAscending = true;
			}
			this.updateHeaders();
			this.updateRows();
		}
		

		// resets the current page to the start. Happens, for example,
		// when a new column is chosen to sort by
		private resetToFirstPage(): void {
			this.currentPage = 1;
		}

		private rowClick(row: HTMLElement): void {
			if (!this.selectRows) {
				return;
			}

			var jqRow = $(row);
			jqRow.removeClass('active');
			var found = false;
			var tmpSelected = [];
			var data = jqRow.data('grid-data');

			// if we find in existing clicked, remove it
			for (var i = 0; i < this.selectedItems.length; i++) {
				if (this.selectedItems[i] !== data) {
					tmpSelected.push(this.selectedItems[i]);
				} else {
					found = true;
				}
			}

			// otherwise add it
			if (!found) {
				this.selectedItems.push(data);
				jqRow.addClass('active');
			} else {
				this.selectedItems = tmpSelected;
			}
		}


		// Redraws the headers - used after a change in sorting
		private updateHeaders(): void {
			// possibly this could be smarter, but for now . . .
			this.drawHeaderAndFooter();
		}
		

		// get data in response to change event
		private getCurrentDataAsPromise(): ng.IPromise<IDataResponse> {
			if (!this.columnDefinitions || this.columnDefinitions.length === 0) {
				return null;
			}

			var sortField = this.columnDefinitions[this.sortColumn].field;
			return this.dataRetreiver.getData(this.filterText, sortField, this.sortAscending, this.pageSize, this.currentPage);
		}


		// general update data method
		// Gets data as a promise, then updates with the results
		private updateRows(): void {
			var dataPromise = this.getCurrentDataAsPromise();
			if (dataPromise == null) {
				return;
			}

			var self = this;
			dataPromise.then(
				function(response) {
					self.updateRowsWithData(response);
				},function(error) {
					self.$log.error(error);
				}
			);
		}

		// updates the table's exisiting dom elements with new data
		private updateRowsWithData(dataResponse: IDataResponse) {
			this.totalItems = dataResponse.totalItems;

			// last page might remove end rows if (rowCount % pageSize !== 0)
			// so put them back until we learn otherwise
			while (this.removedDomRows.length > 0) {
				this.tbodyReference.append(this.removedDomRows.shift().row);
			}
			for (var i = 0; i < this.pageSize; i++) {
				var dataRow = dataResponse.rows[i];
				var domRow = this.domRows[i];

				if (!domRow || !domRow.row) {
					// not initialised yet - still binding
					return;
				}

				if (!dataRow) {
					// last page, incomplete page of data
					domRow.row.data('grid-data', null);
					domRow.row.remove();
					this.removedDomRows.push(domRow);
					continue;
				}

				domRow.row.data('grid-data', dataRow);
				domRow.row.removeClass('active');
				if ($.inArray(dataRow, this.selectedItems) >= 0) {
					domRow.row.addClass('active');
				}
				for (var j = 0; j < domRow.cols.length; j++) {
					var fieldName = this.columnDefinitions[j].field;
					var asHtml = this.columnDefinitions[j].appendAsHtml;
					var fmtFunc = this.columnDefinitions[j].formatFunc;
					var colValue = dataRow[fieldName];
					if (asHtml) {
						domRow.cols[j].empty();
						var el = angular.element(colValue);
						var updateFunc = this.$compile(el);
						var newEl = updateFunc(this.$scope.$parent);
						domRow.cols[j].append(newEl);
					} else {
						if (fmtFunc == null) {
							domRow.cols[j].text(colValue);
						} else {
							domRow.cols[j].text(fmtFunc(colValue));
						}
					}
				}
			}
		}

		private getColumnIndexByHeader(hdrStr: string): number {
			for (var i = 0; i < this.columnDefinitions.length; i++) {
				if (hdrStr === this.columnDefinitions[i].heading) {
					return i;
				}
			}
			return -1;
		}
		
		private drawHeaderAndFooter() {
			this.theadReference.empty();
			this.tfootReference.empty();
			var hRow = $('<tr></tr>');
			var fRow = $('<tr></tr>');
			var self = this;
			for (var i = 0; i < this.columnDefinitions.length; i++) {
				var hdrStr = '<th>' + this.columnDefinitions[i].heading;
				if (this.sortColumn === i) {
					hdrStr += ' <i class=\'fa fa-fw fa-sort-';
					hdrStr += (this.sortAscending ? 'asc' : 'desc');
					hdrStr += '\'></i>';
				}
				hdrStr += '</th>';
				var hdr = $(hdrStr);
				hdr.click(function() {
					self.toggleSort.call(self, hdr);
				});
				hRow.append(hdr);
				fRow.append($('<th>' + this.columnDefinitions[i].heading + '</th>'));
			}
			this.theadReference.append(hRow);
			this.tfootReference.append(fRow);
		}

		
		// This creates the dom structures for the table without putting any content in.
		// When we update our display, we avoid creating dom elements when we can
		private preDrawDomRows(): void {
			if (!this.tbodyReference || !this.columnDefinitions) {
				if (!this.tbodyReference) {
					this.$log.error('no tbody reference set');
				}
				if (!this.columnDefinitions) {
					this.$log.error('no columnDefinitions set');
				}
				return;
			}

			this.tbodyReference.empty();
			this.removedDomRows = [];

			for (var i = 0; i < this.pageSize; i++) {
				var row = $('<tr class=\'row_' + i + '\'></tr>');
				row.click(function() {
					this.rowClick(this);
				});
				var rowRef = {
					row: row,
					cols: [],
				};
				for (var j=0; j < this.columnDefinitions.length; j++) {
					var col = $('<td></td>');
					if (this.columnDefinitions[j].class) {
						col.addClass(this.columnDefinitions[j].class);
					}
					rowRef.row.append(col);
					rowRef.cols[j] = col;
				}
				this.domRows[i] = rowRef;
				this.tbodyReference.append(rowRef.row);
			}
		}

	}

	app.Module.load('app.components.simpleGrid').addController('SimpleGridController', SimpleGridController);
}
