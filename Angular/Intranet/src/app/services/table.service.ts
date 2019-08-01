import { Injectable } from '@angular/core';
@Injectable()

export class tableService {
	public curSort:string = "";

	constructor() {	
	}

	// public sortByKey(array, key) {
	// 	if (this.curSort != key) {
	// 		this.curSort = key;
	// 		return array.sort(function (a, b) {
	// 			var x = a[key]; var y = b[key];
	// 			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	// 		});
	// 	} else {
	// 		this.curSort = "";
	// 		return array.sort(function (a, b) {
	// 			var x = a[key]; var y = b[key];
	// 			return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	// 		});
	// 	}
	// }

	public sortByKey(array, key) {
		if (this.curSort != key) {
			this.curSort = key;

			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				if (isNaN(x) && isNaN(y))
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				else
					return ((Number(x) < Number(y)) ? -1 : ((Number(x) > Number(y)) ? 1 : 0));
			});
		} else {
			this.curSort = "";
			return array.sort(function (a, b) {
				var x = a[key]; var y = b[key];
				if (isNaN(x) && isNaN(y))
					return ((x > y) ? -1 : ((x < y) ? 1 : 0));
				else
					return ((Number(x) > Number(y)) ? -1 : ((Number(x) < Number(y)) ? 1 : 0));
			});
		}
	}
}