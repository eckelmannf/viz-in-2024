import { Component, OnDestroy, Signal, computed, inject, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GedaDataService } from '../../services/geda-data.service';
import { JsonPipe } from '@angular/common';
import { ECharts, EChartsOption } from 'echarts';
import { head, maxBy, min, minBy, reduce, sortBy } from 'lodash-es';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { UncertainValue } from '../../models/uncertain-value';
import { AppService } from '../../services/app.service';
import { delay, tap } from 'rxjs';

@Component({
  selector: 'app-location-widget',
  standalone: true,
  templateUrl: './location-widget.component.html',
  styleUrl: './location-widget.component.scss',
  imports: [NgxEchartsDirective],
  providers: [
    provideEcharts(),
  ]
})
export class LocationWidgetComponent implements OnDestroy {
  private _gedaService = inject(GedaDataService);
  private _appService = inject(AppService);

  chartInstance?: ECharts;
  // private _resizeSub = this._appService.sideNavOpen$.pipe(delay(2000), tap(() => console.log("trigger RESIZE"))).subscribe(() => this.chartInstance?.resize());

  showBar = model(false);
  locationData = toSignal(this._gedaService.locationData$);
  options: Signal<EChartsOption> = computed(() => {
    const data = this.locationData();

    const chartdata = reduce(data, (prev, curr, key) => {
      if (key !== 'Deutschland') {
        const totalRow = head(curr);
        prev.data.push({ name: key, value: totalRow?.Percent ?? 0, upper: totalRow?.UpperCL ?? 0, lower: totalRow?.LowerCL ?? 0 });
      }
      return prev;
    }, { data: [] as ({ name: string, } & UncertainValue)[] });
    chartdata.data = sortBy(chartdata.data, x => x.name);

    if (this.showBar()) {
      return <EChartsOption>{
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            rotate: 30,
            overflow: 'truncate',
            width: 75,
          },
          data: chartdata.data.map(function (item) {
            return item.name;
          })
        },
        visualMap: {
          left: 'right',
          min: minBy(chartdata.data, x => x.value)?.value ?? 0,
          max: maxBy(chartdata.data, x => x.value)?.value ?? 0,
          seriesIndex: 0,
          inRange: {
            color: [
              '#313695',
              '#4575b4',
              '#74add1',
              '#abd9e9',
              '#e0f3f8',
              '#ffffbf',
              '#fee090',
              '#fdae61',
              '#f46d43',
              '#d73027',
              '#a50026'
            ]
          },
          text: ['High', 'Low'],
          formatter: '{value}%',
          calculable: true
        },
        tooltip: {
          valueFormatter: (value) => `${value}%`
        },
        series: [
          {
            type: 'bar',
            id: 'population',
            data: chartdata.data.map(function (item) {
              return item.value;
            }),
            animationDurationUpdate: 1000,
            universalTransition: true
          },
          {
            data: chartdata.data.map(x => [x.lower, x.upper, x.lower, x.upper]),
            // dimension: 0,
            type: 'candlestick',
            animationDelay: 800
          }
        ]
      }
    }

    return {
      tooltip: {
        formatter: '{value}%',
        // valueFormatter: (value) => `${value}%`
      },
      visualMap: {
        left: 'right',
        min: minBy(chartdata.data, x => x.value)?.value ?? 0,
        max: maxBy(chartdata.data, x => x.value)?.value ?? 0,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        },
        text: ['High', 'Low'],
        formatter: '{value}%',
        calculable: true
      },
      series: [
        {
          id: 'population',
          type: 'map',
          roam: true,
          map: 'GER',
          universalTransition: true,
          data: chartdata.data
        }
      ]
    }
  });

  ngOnDestroy(): void {
    // this._resizeSub.unsubscribe();
  }
}
