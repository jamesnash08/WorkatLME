import { Injectable } from '@angular/core';
@Injectable()

export class dateService {

	constructor() {	
	}

	CYMDtoMDY(date) {
		if (date.toString().length > 0) {
			var rtn = date.toString();
			return rtn.substring(3, 5) + "/" + rtn.substring(5, 7) + "/" + rtn.substring(1, 3);
		}
		else
			return "";
	}

	returnTime(time) {
		if (time.toString().length > 0) {
			var rtn = time.toString();
			return rtn.substring(1, 3) + ":" + rtn.substring(3, 5) + ":" + rtn.substring(5, 7);
		}
		else
			return "";
	}
}