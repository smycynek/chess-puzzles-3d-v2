import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Chess3dComponent } from './app/chess3d.component';

bootstrapApplication(Chess3dComponent, appConfig).catch((err) => console.error(err));
