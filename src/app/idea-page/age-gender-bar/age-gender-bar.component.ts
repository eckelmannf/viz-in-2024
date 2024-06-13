import { Component, Signal, computed, inject, input } from '@angular/core';
import { GedaRow } from '../../services/geda-data.service';
import { GedaTableComponent } from '../../geda-table/geda-table.component';
import { find, isNumber, xor } from 'lodash-es';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { NgLetDirective, NgLetModule } from 'ng-let';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { combineLatest, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-age-gender-bar',
  standalone: true,
  imports: [GedaTableComponent, NgxEchartsDirective, NgLetModule],
  templateUrl: './age-gender-bar.component.html',
  styleUrl: './age-gender-bar.component.scss',
  providers: [
    provideEcharts(),
  ]
})
export class AgeVizComponent {
  data = input.required<GedaRow[]>();

  private _breakpointObserver = inject(BreakpointObserver);
  private _isSmallViewport$ = this._breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(map(state => state.matches));
  isSmallViewport = toSignal(this._isSmallViewport$);

  options = computed(() => {
    const data = this.data();
    const chartData = data.filter(x => x.Altersgruppe !== 'Gesamt' && x.Gender !== 'Gesamt' && x.Bildungsgruppe === 'Gesamt' && x.Bundesland === 'Deutschland');

    const xAxisSplitNumber = this.isSmallViewport() ? 5 : 10;

    return <EChartsOption>{
      grid: { top: 0, right: 32, bottom: 32, left: 96 },
      xAxis: {
        type: 'value' as const,
        min: -100,
        max: 100,
        splitNumber: xAxisSplitNumber,
        axisLabel: {
          formatter: (value: number, index: number) => {
            return `${Math.abs(value).toFixed(1)}%`
          },
        },
      },
      yAxis: {
        type: 'category' as const,
        axisTick: { show: false }
      },
      tooltip: {
        valueFormatter: (value) => {
          if (value && isNumber(value)) {
            return `${Math.abs(value).toFixed(1)}%`
          }
          return value;
        },
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      series: [
        {
          type: 'bar' as const,
          name: 'Männer',
          data: chartData.filter(x => x.Gender === 'Männer').map(x => [-x.Percent, x.Altersgruppe]),
          stack: '1'
        },
        {
          type: 'bar' as const,
          name: 'Frauen',
          data: chartData.filter(x => x.Gender === 'Frauen').map(x => [x.Percent, x.Altersgruppe]),
          stack: '1'
        }
      ]
    }
  });


}
