import { Component, OnDestroy, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ECharts, EChartsOption } from 'echarts';
import { head, reduce } from 'lodash-es';
import { UncertainValue } from '../../models/uncertain-value';
import { GedaDataService } from '../../services/geda-data.service';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-edjucation-widget',
  standalone: true,
  templateUrl: './edjucation-widget.component.html',
  styleUrl: './edjucation-widget.component.scss',
  imports: [NgxEchartsDirective],
  providers: [
    provideEcharts(),
  ]
})
export class EdjucationWidgetComponent implements OnDestroy {
  private _gedaService = inject(GedaDataService);
  private _appService = inject(AppService);

  chartInstance?: ECharts;
  // private _resizeSub = this._appService.sideNavOpen$.subscribe(() => this.chartInstance?.resize());

  educationData = toSignal(this._gedaService.educationData$);
  options: Signal<EChartsOption> = computed(() => {
    const data = this.educationData();
    const chartData = reduce(data, (prev, curr, key) => {
      if (key !== 'Gesamt') {
        prev.cats.push(key);

        const totalRow = head(curr);
        prev.data.push({ value: totalRow?.Percent ?? 0, lower: totalRow?.LowerCL ?? 0, upper: totalRow?.UpperCL ?? 0 })
      }
      return prev;
    }, { cats: [] as string[], data: [] as UncertainValue[] });

    return {
      xAxis: {
        type: 'category',
        data: chartData.cats
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%' }
      },
      tooltip: {
        valueFormatter: (value) => `${value}%`
      },
      series: [
        {
          data: chartData.data,
          type: 'bar'
        },
        {
          data: chartData.data.map(x => [x.lower, x.upper, x.lower, x.upper]),
          type: 'candlestick',
        }
      ]
    };
  });

  ngOnDestroy(): void {
    // this._resizeSub.unsubscribe();
  }
}
