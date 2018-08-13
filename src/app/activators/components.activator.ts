import { Routes, Route } from "@angular/router";
import { Type } from "@angular/core";

class Activator {
    private componentsCollection:Type<any>[] = [];

    getComponents():Type<any>[] {
        return this.componentsCollection;
    }

    registerComponent(component:Type<any>) {
        this.componentsCollection.push(component);
    }
}

export let ComponentsActivator = new Activator()