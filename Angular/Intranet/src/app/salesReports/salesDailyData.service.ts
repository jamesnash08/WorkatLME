import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable }                                         from '@angular/core';
import { Observable }                                         from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class SalesDataService {

	private dailyUrl: string;
	private monthlyUrl: string;

	constructor(private http: HttpClient) {

		this.dailyUrl = environment.API + '/sales/salesDailyTotal';
		this.monthlyUrl = environment.API + '/sales/salesMonthlyTotal';

	}

	getDailyTotals() {
		return this.http.get(this.dailyUrl);
	}

	getMonthlyTotals() {
		return this.http.get(this.monthlyUrl);
	}

}
