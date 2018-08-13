import { InMemoryDbService } from "angular-in-memory-web-api";
import IDevice from "../interfaces/IDevice";
import { ResponseOptions } from "@angular/http";
import { IGpsDataRecord } from "../interfaces/IGpsData";
import { URLSearchParams } from '@angular/http';

function getRandomIntInclusive(min:number, max:number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function radians(v:number) {
    return v * Math.PI / 180;
}

export default class InMemoryServer implements InMemoryDbService {

    private lat:number = 0;
    private lon:number = 0;

    constructor() {
        this.lat = 55.7462 + getRandomIntInclusive(0.01, 0.03);
        this.lon = 37.6209 + getRandomIntInclusive(0.01, 0.03);
    }

    createDb(): {} {
        const devices:IDevice[] = [{ name: 'Test device', id: 1}];
        const gpsdata:IGpsDataRecord[] = [
            {
                latitude: 55.774085998535156,
                radius: 18,
                longitude: 37.646949768066406,
                timestamp:  1533648486
             },
            {
                latitude: 55.774261474609375,
                radius: 83,
                longitude: 37.65694808959961,
                timestamp:  1533648586
            }
        ];

        return {
            'device': devices,
            'gpsdata': gpsdata
        };
    }

    responseInterceptor(resOpt: ResponseOptions, reqInfo: any) {
        if (reqInfo.resourceUrl === '/gpsdata/') {
            this.handleGpsDataRequest(resOpt, reqInfo);
        }
        return resOpt;
    }

    private handleGpsDataRequest(resOpt: ResponseOptions, reqInfo: any) {
        let params:URLSearchParams = reqInfo.query as URLSearchParams;
        let start = parseInt(params.get('timestart'), 10);
        let end = parseInt(params.get('timeend'), 10);
        let delta = getRandomIntInclusive(100, (end - start) % 1000);
        let result = [];

        for (let i = 0; i < delta; i++) {
            let clat=(this.lat+((i) * Math.sin(radians(i))/100));
            let clon=(this.lon+((i) * Math.cos(radians(i))/100));
            
            let data:IGpsDataRecord = {
                latitude: clat,
                longitude: clon,
                radius: getRandomIntInclusive(10, 100),
                timestamp:  start + i
            }
            
            result.push(data);
        }

        reqInfo.collection = result;

        resOpt.body = JSON.stringify({ data: reqInfo.collection });
    }
}