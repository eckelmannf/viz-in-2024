import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { IdeaPageComponent } from './idea-page/idea-page.component';
import { IdeaOverviewPageComponent } from './idea-overview-page/idea-overview-page.component';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent },
    { path: 'idea', component: IdeaPageComponent },
    { path: 'overview', component: IdeaOverviewPageComponent },
    { path: '**', redirectTo: '/home', pathMatch: 'full' }
];
