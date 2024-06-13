import { Component, computed, input, model, output } from '@angular/core';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { GedaRow } from '../../services/geda-data.service';
import { EChartsOption } from 'echarts';
import { debounce, isNumber, maxBy, minBy } from 'lodash-es';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgxEchartsDirective, MatSlideToggleModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  providers: [
    provideEcharts(),
  ]
})
export class MapComponent {

  private _bundeslandSelectedEmitter = debounce(x => this.bundeslandSelected.emit(x), 200);

  data = input.required<GedaRow[]>();
  bundeslandSelected = output<string | null>();
  standardize = model<boolean>(true);

  options = computed(() => {
    const standardize = this.standardize();
    const data = this.data().filter(x => x.Bundesland !== 'Deutschland' && x.Gender === 'Gesamt' && x.Bildungsgruppe === 'Gesamt' && x.Altersgruppe === 'Gesamt' && x.Standard === (standardize ? 1 : 0))
    const chartData = data.map(x => {
      return { value: x.Percent, name: x.Bundesland }
    });

    const minMax = { min: minBy(chartData, x => x.value)?.value ?? 0, max: maxBy(chartData, x => x.value)?.value ?? 0 }

    return <EChartsOption>{
      grid: { top: 0, left: 0, right: 0, bottom: 0 },
      tooltip: {
        formatter: (item: { name: string, value: number }) => {
          return `${item.name}: ${item.value.toFixed(1)}%`;
        },
      },
      visualMap: {
        left: 'right',
        min: minMax.min,
        max: minMax.max,
        inRange: {
          color: [
            '#b6d9fc',
            '#03284c',
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
          map: 'GER',
          data: chartData,
          select: { disabled: true },
          zoom: 1.2,
          emphasis: {
            focus: 'self',
            label: { show: false },
            itemStyle: { areaColor: 'none' }
          }
        }
      ]
    };
  });

  emitBundeslandSelected(bundesland: string | null) {
    this._bundeslandSelectedEmitter(bundesland);
  }

}
