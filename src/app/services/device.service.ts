import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import IDevice from '../interfaces/IDevice';
import { Subject } from '../../../node_modules/rxjs/Subject';

@Injectable()
export class DeviceService {

    private _devices:IDevice[] = [];
    private _currentDevice:IDevice|undefined = undefined;
    private devicesChangedSource = new Subject<IDevice[]>();

    devicesChanged$ = this.devicesChangedSource.asObservable();

    constructor(private http: Http) {
    }

    get devices():IDevice[] {
        return this._devices.map(device => ({ ...device }));
    }

    set currentDevice(device:IDevice) {
        this._currentDevice = device;
    }

    get currentDevice():IDevice|undefined {
        return this._currentDevice;
    }

    requestForDevices():Promise<IDevice[]> {
        return this.http.get('device')
        .toPromise()
        .then(response => response.json())
        .then((response:{ data: IDevice[] }) => {
            this._devices = response.data;
            this.devicesChangedSource.next(this.devices);

            return this.devices;
        });
    }

    registerDevice(name: string):Promise<IDevice> {
        return this.http.post('device', {
            name: name
        })
        .toPromise()
        .then(response => response.json())
        .then((response:{ data:IDevice }) => {
            this._devices.push(response.data);
            this.devicesChangedSource.next(this.devices);

            return response.data;
        });
    }

    removeDevice(id: number):Promise<void> {
        return this.http.delete(`device/${id}`)
        .toPromise()
        .then(response => response.json())
        .then(() => {
            this._devices = this._devices.filter(device => device.id !== id);
            this.devicesChangedSource.next(this.devices);
        });
    }
}