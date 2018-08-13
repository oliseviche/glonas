import './views/views';
import './components/float-menu/float-menu.component';
import './components/selector/selector.component';
import './components/flex-table/flex-table.component';

import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, EmbeddedViewRef, ViewChild, OnDestroy, Renderer2, NgZone } from "@angular/core";
import { MapNavComponent } from './components/map-nav/map-nav.component';
import { DataService } from './services/data.service';
import { DeviceService } from './services/device.service';
import { IGpsDataRecord } from './interfaces/IGpsData';
import { FloatMenuComponent } from './components/float-menu/float-menu.component';
import { Subscription } from '../../node_modules/rxjs/Subscription';
import IDevice from './interfaces/IDevice';

const toggleTable = require ('./img/table.svg');

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DeviceService, DataService]
})
export class AppComponent implements OnInit, OnDestroy {
    @ViewChild('init', { read: ViewContainerRef })
    private initViewRef:ViewContainerRef;
    @ViewChild('floatMenu', { read: FloatMenuComponent })
    private floatMenu:FloatMenuComponent;
    private map:ymaps.Map;
    private whenInitializationCompleted:Promise<IGpsDataRecord[]|null>;
    private recordChangedSubscription:Subscription;
    private dataChangedSubscription:Subscription;
    private tableMode:boolean = false;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private devicesService:DeviceService,
        private dataService:DataService, private renderer:Renderer2, private zone:NgZone) {

        this.whenInitializationCompleted = this.initPromisableTasksChain(this.deviceRequestTask, this.gpsDataRequestTask)
        .catch((ex:Error) => {
            debugger
        });

    }

    protected get currentDevice():IDevice | undefined {
        return this.devicesService.currentDevice;
    }

    ngOnInit(): void {
        this.initYandeMap().then((map) => {
            this.map = map;
            this.initNavComponent(map);
            this.whenInitializationCompleted.then(() => {
                this.drawPlacemarks();
                this.dataChangedSubscription = this.dataService.dataChanged$.subscribe(this.onDataChanged.bind(this));
            });
        });
    }

    ngOnDestroy(): void {
        this.recordChangedSubscription.unsubscribe();
        this.dataChangedSubscription.unsubscribe();
    }

    private initYandeMap():Promise<ymaps.Map> {
        return new Promise((resolve) => {
            ymaps.ready(() => {
                let map = new ymaps.Map("map", {
                    center: [55.76, 37.64],
                    zoom: 7,
                    controls: ['zoomControl']
                });
                resolve(map);
            });
        });
    }

    private initNavComponent(map:ymaps.Map) {
        let context = this;
        let factory = this.componentFactoryResolver.resolveComponentFactory(MapNavComponent);
        let component = this.initViewRef.createComponent(factory);

        this.recordChangedSubscription = component.instance.recordChanged$.subscribe(this.recordChanged.bind(this))

        let NavigationLayout:any = ymaps.templateLayoutFactory.createClass('<div class="map-nav-container"></div>', {
            build: function() {
                NavigationLayout.superclass.build.call(this);
                let domElem = (component.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
                document.querySelector('.map-nav-container').appendChild(domElem);
            }
        });

        let TableViewLayout:any = ymaps.templateLayoutFactory.createClass(`<div class="table-toggler"><button><img src="${toggleTable}" /></button></div>`, {
            build: function() {
                TableViewLayout.superclass.build.call(this);
                let element:HTMLButtonElement = document.querySelector('.table-toggler button') as HTMLButtonElement;
                context.renderer.listen(element, 'click', () => {
                    context.zone.run(() => context.toggleMode());
                });
            }
        });

        let TableButton = new ymaps.control.Button({
            options: {
                layout: TableViewLayout
            }
        });

        let navButton = new ymaps.control.Button({
            options: {
                layout: NavigationLayout
            }
        });

        map.controls.add(navButton, {
            position: {
                left: '50%',
                bottom: 5
            }
        });

        map.controls.add(TableButton, {
            position: {
                left: 10,
                top: 10
            }
        });
    }

    private initPromisableTasksChain(...tasks:((...args:any[]) => Promise<any>)[]):Promise<any> {
        let result:Promise<any> = Promise.resolve();

        result = tasks.shift().call(this, []);

        tasks.forEach(task => {
            result = result.then((...args:any[]) => task.call(this, ...args));
        });

        return result;
    }

    private deviceRequestTask():Promise<IDevice[]> {
        return this.devicesService.requestForDevices();
    }

    private gpsDataRequestTask(devices:IDevice[]) {
        if (devices.length) {
            let device = devices.slice(0).pop();
            return this.dataService.requestForGpsData(device.id, this.dataService.startDate, this.dataService.endDate);
        }
        return Promise.resolve([]);
    }

    private drawPlacemarks() {
        this.map.geoObjects.removeAll();

        this.dataService.records.forEach((record:IGpsDataRecord) => {
            let placemark = new ymaps.Placemark([
                record.latitude,
                record.longitude
            ], {}, {
                preset: 'islands#circleIcon',
                iconColor: '#0095b6'
            });

            let circle = new ymaps.Circle([
                [record.latitude, record.longitude],
                record.radius
            ], {}, {
                fillColor: "#DB709377",
            });
        
            this.map.geoObjects.add(circle);
            this.map.geoObjects.add(placemark);
        });
    }

    private openMenu() {
        this.floatMenu.open();
    }

    private recordChanged(record:IGpsDataRecord) {
        this.map.panTo([record.latitude, record.longitude], {
            flying: false
        });
    }

    private onDataChanged():void {
        this.drawPlacemarks();
    }

    private toggleMode() {
        this.tableMode = !this.tableMode;
    }
}