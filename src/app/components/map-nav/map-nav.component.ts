import { Component, OnInit, OnDestroy } from "@angular/core";
import { ComponentsActivator } from "../../activators/components.activator";
import { DataService } from "../../services/data.service";
import { IGpsDataRecord } from "../../interfaces/IGpsData";
import { Subscription } from "../../../../node_modules/rxjs/Subscription";
import { Subject } from "../../../../node_modules/rxjs/Subject";

@Component({
    selector: 'map-nav',
    templateUrl: './map-nav.component.html',
    styleUrls: ['./map-nav.component.css']
})
export class MapNavComponent implements OnInit, OnDestroy {

    private currentIndex:number = 0;
    private records:IGpsDataRecord[] = [];
    private dataChangedSubscription:Subscription;
    private recordChangedSource:Subject<IGpsDataRecord> = new Subject<IGpsDataRecord>();

    recordChanged$ = this.recordChangedSource.asObservable();

    constructor(private dataService:DataService) {
        this.dataChangedSubscription = this.dataService.dataChanged$.subscribe(this.onDataChanged.bind(this));
    }

    get value():string {
        return `${ this.records.length ? this.currentIndex + 1 : 0} / ${ this.records.length }`;
    }

    ngOnInit(): void {
        this.records = this.dataService.records;
    }

    ngOnDestroy(): void {
        this.dataChangedSubscription.unsubscribe();
    }

    private previousRecord() {
        this.currentIndex = --this.currentIndex < 0 ? this.records.length - 1 : this.currentIndex;
        this.recordChangedSource.next(this.records[this.currentIndex]);
    }

    private nextRecord() {
        this.currentIndex = (++this.currentIndex) % this.records.length;
        this.recordChangedSource.next(this.records[this.currentIndex]);
    }

    private onDataChanged(records:IGpsDataRecord[]) {
        this.currentIndex = 0;
        this.records = records;
    }

    private doManualEnter(event:Event) {
        let element:HTMLInputElement = event.target as HTMLInputElement;
        element.focus();
        element.selectionStart = 0;
        element.selectionEnd = element.value.length;
    }
}

ComponentsActivator.registerComponent(MapNavComponent)