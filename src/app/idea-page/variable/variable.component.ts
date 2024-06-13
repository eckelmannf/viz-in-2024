import { Component, computed, inject, input, model } from '@angular/core';
import { GedaDataService, VariableInfo } from '../../services/geda-data.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { NgLetDirective, NgLetModule } from 'ng-let';
import { JsonPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { GedaTableComponent } from '../../geda-table/geda-table.component';
import { AgeVizComponent } from '../age-gender-bar/age-gender-bar.component';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { head } from 'lodash-es';
import { EChartsOption } from 'echarts';
import { BrPipe } from '../../pipes/br.pipe';
import { GenderGaugesComponent } from '../gender-gauges/gender-gauges.component';
import { MapComponent } from '../map/map.component';
import { MatIconModule } from '@angular/material/icon';
import { EducationVizComponent } from '../education-viz/education-viz.component';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { TotalGaugeComponent } from '../total-gauge/total-gauge.component';

@Component({
  selector: 'app-variable',
  standalone: true,
  imports: [NgLetModule, JsonPipe, BrPipe, GedaTableComponent, AgeVizComponent, NgxEchartsDirective, GenderGaugesComponent, MapComponent, MatIconModule, EducationVizComponent, MatSlideToggleModule],
  templateUrl: './variable.component.html',
  styleUrl: './variable.component.scss',
  providers: [
    provideEcharts()
  ]
})
export class VariableVizComponent {
  variable = input.required<VariableInfo>();
  selectedBundesland = model<string | null>(null);
  educationChartType = model<'radar'|'gauge'>('radar');

  private _gedaService = inject(GedaDataService);
  private _variable$ = toObservable(this.variable);
  private _variableData$ = this._variable$.pipe(
    switchMap(variable => this._gedaService.rawData$.pipe(map(data => data.filter(x => x.Variable === variable.id)))),
    shareReplay(1)
  );
  data = toSignal(this._variableData$.pipe(map(data => {
    return data; //data.filter(x => x.Bundesland === 'Deutschland');
  })))

  // bildungData = computed(() => {
  //   return this.data()?.filter(x => x.Bildungsgruppe !== 'Gesamt')
  // })
 
  constructor() {
  }

}
