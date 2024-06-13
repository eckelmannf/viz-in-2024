import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LocationWidgetComponent } from './location-widget/location-widget.component';
import { GedaDataService } from '../services/geda-data.service';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AgeWidgetComponent } from './age-widget/age-widget.component';
import { EdjucationWidgetComponent } from './edjucation-widget/edjucation-widget.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatToolbarModule,
    LocationWidgetComponent,
    AgeWidgetComponent,
    EdjucationWidgetComponent,
    JsonPipe
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private _gedaService = inject(GedaDataService);

  variables = toSignal(this._gedaService.variables$);
  selectedVariable = toSignal(this._gedaService.selecetedVariable$);
  selecetedTabIndex = computed(() => {
    const sv = this.selectedVariable();
    const vars = this.variables();
    return sv && vars ? vars.indexOf(sv) : 0;
  })

  selectedGender = toSignal(this._gedaService.selectedGender$);
  standardizeAge = toSignal(this._gedaService.standardizeAge$);

  totalMeasure = toSignal(this._gedaService.totalMeasure$);
  totalMeasureStr = computed(() => {
    const gender = this.selectedGender();
    const value = this.totalMeasure();
    const genderStr = gender === 'Gesamt' ? 'Erwachsenen' : gender;
    return `${value}% der ${genderStr}`;
  });
  ageMeasure = toSignal(this._gedaService.ageMeasure$);
  locationMeasure = toSignal(this._gedaService.locationMeasure$);
  test = toSignal(this._gedaService.test$);

  setSelectedVariable(variable: string) {
    this._gedaService.selectedVariable = variable;
  }

  setSelectedGender(gender: string) {
    this._gedaService.selectedGender = gender;
  }

  setStandardizeAge(value: boolean) {
    this._gedaService.standardizeAge = value;
  }
}

