import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { Chess3dComponent } from './chess3d.component';

@NgModule({
  declarations: [
    Chess3dComponent,
  ],
  imports: [
    BrowserModule, NgbModule, FormsModule, AppRoutingModule,
  ],
  providers: [],
  bootstrap: [Chess3dComponent],
})
export class AppModule { }
