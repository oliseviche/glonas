import '../devices-panel/devices-panel.component';

import { Component, ElementRef, Renderer2, ViewChild, OnInit } from "@angular/core";
import { ComponentsActivator } from "../../activators/components.activator";

type PanelStackEntry = {
    name: string;
    element: HTMLDivElement
};

@Component({
    selector: 'float-menu',
    templateUrl: './float-menu.component.html',
    styleUrls: ['./float-menu.component.css'],
    exportAs: 'floatMenu'
})
export class FloatMenuComponent implements OnInit {

    private isOpened:boolean;
    private panelsStack:PanelStackEntry[] = [];

    @ViewChild('options') optionsPanel:ElementRef;

    constructor(private renderer:Renderer2) {
    }

    get panelName() {
        return this.panelsStack[0].name;
    }

    ngOnInit(): void {
      this.panelsStack.push({
          name: '',
          element: this.optionsPanel.nativeElement
      });
    }

    open():void {
        if (!this.isOpened) {
            this.isOpened = true;
        }
    }

    close():void {
        if (this.isOpened) {
            this.isOpened = false;
        }
    }

    private openPanel(element:HTMLDivElement, name: string) {
        this.renderer.removeClass(this.panelsStack[0].element, 'float-menu__panel--active');
        this.renderer.addClass(element, 'float-menu__panel--active');
        this.panelsStack.unshift({
            name: name,
            element: element
        });
    }

    private closePanel() {
        if (this.panelsStack.length > 1) {
            let currentPanel = this.panelsStack.shift();
            this.renderer.removeClass(currentPanel.element, 'float-menu__panel--active');
            this.renderer.addClass(this.panelsStack[0].element, 'float-menu__panel--active');
        }
    }
}

ComponentsActivator.registerComponent(FloatMenuComponent)