import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { IGpsDataRecord } from '../interfaces/IGpsData';
import { Subject } from '../../../node_modules/rxjs/Subject';

@Injectable()
export class DataService {
    private _startDate:Date = new Date(Date.now());
    private _endDate:Date = new Date(Date.now());
    private _records:IGpsDataRecord[] = [];
    private dataChangedSource = new Subject<IGpsDataRecord[]>();

    dataChanged$ = this.dataChangedSource.asObservable();

    constructor(private http: Http) {
    }

    get records():IGpsDataRecord[] {
        return this._records.map(r => ({...r}));
    }

    get startDate():Date {
        return this._startDate;
    }

    set startDate(value:Date) {
        this._startDate = value;
    }

    get endDate():Date {
        return this._endDate;
    }

    set endDate(value:Date) {
        this._endDate = value;
    }

    requestForGpsData(deviceId:number, timeStart:Date, timeEnd:Date):Promise<IGpsDataRecord[]> {
        let params:URLSearchParams = new URLSearchParams();

        params.append('id', deviceId.toString(10));
        params.append('timestart', timeStart.getTime().toString(10));
        params.append('timeend', timeEnd.getTime().toString(10));

        return this.http.get('gpsdata', { params: params })
        .toPromise()
        .then(response => response.json())
        .then((response: { data: IGpsDataRecord[] }) => {
            this._records = response.data;
            this.dataChangedSource.next(this.records);

            return this.records;
        });
    }
}