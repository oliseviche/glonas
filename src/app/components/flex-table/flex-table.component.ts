import { Component, Input, OnChanges, SimpleChanges, SimpleChange } from "@angular/core";
import { ComponentsActivator } from "../../activators/components.activator";
import { DataService } from "../../services/data.service";
import { IGpsDataRecord } from "../../interfaces/IGpsData";
import { Subscription } from "../../../../node_modules/rxjs/Subscription";

const ITEMS_PER_PAGE = 20;

@Component({
    selector: 'flex-table',
    templateUrl: './flex-table.component.html',
    styleUrls: ['./flex-table.component.css']
})
export class FlexTableComponent implements OnChanges {

    @Input('active')  
    private active:boolean = false;
    private _records:IGpsDataRecord[] = [];
    private dataSubscription:Subscription;
    private pagesCount:number = 0;
    private currentPage:number = 0;

    constructor(private dataService:DataService) {
    }

    get value():string {
        return `page ${this.currentPage} of ${this.pagesCount}`;
    }

    get records():IGpsDataRecord[] {
        let from = (this.currentPage - 1) * ITEMS_PER_PAGE;
        let to = from + ITEMS_PER_PAGE;
        return this._records.slice(from, to);
    }

    ngOnChanges(changes: SimpleChanges):void {
        let activeChange:SimpleChange = changes['active'];

        if (activeChange.isFirstChange || activeChange.currentValue !== activeChange.previousValue) {
            if (this.active) {
                this.dataSubscription = this.dataService.dataChanged$.subscribe(this.onDataChanged.bind(this));
                this._records = this.dataService.records;
                this.updatePagerModel();
            } else {
                this._records = [];

                if (this.dataSubscription) {
                    this.dataSubscription.unsubscribe();
                }
            }
        }
    }

    private onDataChanged() {
        this._records = this.dataService.records;
        this.updatePagerModel();
    }

    private updatePagerModel() {
        this.pagesCount = ((this._records.length / ITEMS_PER_PAGE) | 0) + (this._records.length % ITEMS_PER_PAGE > 0 ? 1 : 0);
        this.currentPage = this.pagesCount > 0 ? 1 : 0;
    }

    private previousPage() {
        if (this.currentPage - 1 === 0) {
            return;
        }

        this.currentPage--;
    }

    private nextPage() {
        if (this.currentPage + 1 > this.pagesCount) {
            return
        }

        this.currentPage++;
    }

    private orderNum(index:number):number {
        return (index + 1) + (this.currentPage - 1) * ITEMS_PER_PAGE;
    }
}

ComponentsActivator.registerComponent(FlexTableComponent)