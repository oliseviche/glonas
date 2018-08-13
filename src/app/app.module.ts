import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpModule } from "@angular/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ComponentsActivator } from './activators/components.activator';
import { AppComponent } from './app.component';
import { MapNavComponent } from './components/map-nav/map-nav.component';
import InMemoryServer from './utils/in-memory-server';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "client/assets/i18n/");
}

@NgModule({
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    imports: [
        BrowserModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpModule,
        HttpClientModule,
        InMemoryWebApiModule.forRoot(InMemoryServer, { 
            post204: false, 
            passThruUnknownUrl: true,
            apiBase: ''
        }),
    ],
    declarations: [
        AppComponent,
        ...ComponentsActivator.getComponents()
    ],
    entryComponents:[MapNavComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
