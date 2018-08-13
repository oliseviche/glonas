import { Component, OnInit, OnDestroy } from "@angular/core";
import { ComponentsActivator } from "../../activators/components.activator";
import { DataService } from "../../services/data.service";
import { IGpsDataRecord } from "../../interfaces/IGpsData";
import { Subscription } from "../../../../node_modules/rxjs/Subscription";
import { Subject } from "../../../../node_modules/rxjs/Subject";
import { DeviceService } from "../../services/device.service";
import IDevice from "../../interfaces/IDevice";

@Component({
    selector: 'selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit, OnDestroy {
    private devices:IDevice[] = [];
    private deviceChangedSubscription:Subscription;
    private startDate:Date;
    private endDate:Date;
    private selectedDeviceId:number|undefined = undefined;

    constructor(private deviceService:DeviceService, private dataService:DataService) {
        this.deviceChangedSubscription = this.deviceService.devicesChanged$.subscribe(this.onDevicesChanged.bind(this));
        this.startDate = this.dataService.startDate;
        this.endDate = this.dataService.endDate;
    }

    ngOnInit(): void {
        this.devices = this.deviceService.devices;
        this.setDefaultDevice();
    }

    ngOnDestroy(): void {
        this.deviceChangedSubscription.unsubscribe();
    }

    private onDevicesChanged(devices:IDevice[]) {
        this.devices = devices;
        this.setDefaultDevice();
    }

    private apply() {
        if (this.selectedDeviceId && this.startDate && this.endDate) {
            this.deviceService.currentDevice = this.devices.find(d => d.id === this.selectedDeviceId);
            this.dataService.startDate = this.startDate;
            this.dataService.endDate = this.endDate;
            this.dataService.requestForGpsData(this.selectedDeviceId, this.startDate, this.endDate);
        }
    }

    private setDefaultDevice() {
        this.deviceService.currentDevice = this.devices.find(d => d.id === this.selectedDeviceId) || this.devices.slice(0).pop();
        this.selectedDeviceId = (this.deviceService.currentDevice && this.deviceService.currentDevice.id) || undefined
        
    }
}

ComponentsActivator.registerComponent(SelectorComponent)