import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { FetchPalaceHttpService } from "./fetch-palace-http.service";
import { ErrorInterceptorProvider } from "./shared/interceptors/error/error.interceptor";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatBadgeModule,
    CdkScrollableModule,
    ScrollingModule
  ],
  providers: [FetchPalaceHttpService, ErrorInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
