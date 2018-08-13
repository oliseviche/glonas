import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ComponentsActivator } from "../../activators/components.activator";
import { DeviceService } from "../../services/device.service";
import { Subscription } from "../../../../node_modules/rxjs/Subscription";
import IDevice from "../../interfaces/IDevice";
import { FormControl, NgModel } from "../../../../node_modules/@angular/forms";

@Component({
    selector: 'devices-panel',
    templateUrl: './devices-panel.component.html',
    styleUrls: ['./devices-panel.component.css']
})
export class DevicesPanelComponent implements OnInit, OnDestroy {

    @ViewChild('nameInput') 
    private nameInput:ElementRef;

    private deviceChangedSubscription:Subscription;
    private devices:IDevice[] = [];

    constructor(private deviceService:DeviceService) {
    }

    ngOnInit(): void {
        this.devices = this.deviceService.devices;
        this.deviceChangedSubscription = this.deviceService.devicesChanged$.subscribe(this.devicesChanged.bind(this));
    }

    ngOnDestroy(): void {
        this.deviceChangedSubscription.unsubscribe();
    }

    private registerDevice(event:Event, input: NgModel) {
        event.preventDefault();

        this.deviceService.registerDevice(input.value);
        input.reset('');

        (this.nameInput.nativeElement as HTMLInputElement).focus();
    }

    private removeDevice(id:number) {
        this.deviceService.removeDevice(id);
    }
    
    private devicesChanged(devices:IDevice[]) {
        this.devices = devices;
    }
}

ComponentsActivator.registerComponent(DevicesPanelComponent)