import { Component, computed, input } from '@angular/core';
import { EChartsOption, SeriesOption } from 'echarts';
import * as echarts from 'echarts';
import { uniqBy, size, orderBy, maxBy, minBy, take, isNumber } from 'lodash-es';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { filter, groupBy, map, reduce } from 'lodash-es';
import { GedaTableComponent } from '../../geda-table/geda-table.component';
import { GedaRow } from '../../services/geda-data.service';
import { percentValueFormatter } from '../../models/constants';

type StratifyProperties = 'Gender' | 'Bildungsgruppe' | 'Altersgruppe' | 'Bundesland';

@Component({
  selector: 'app-variables-radar',
  standalone: true,
  templateUrl: './variables-radar.component.html',
  styleUrl: './variables-radar.component.scss',
  imports: [NgxEchartsDirective, GedaTableComponent],
  providers: [
    provideEcharts()
  ]
})
export class VariablesRadarComponent {
  data = input.required<GedaRow[]>();
  stratifyBy = input<StratifyProperties | null>(null);
  dataPredicates: Record<StratifyProperties, (x: GedaRow) => boolean> = {
    Gender: x => x.Gender === 'Gesamt',
    Altersgruppe: x => x.Altersgruppe === 'Gesamt',
    Bildungsgruppe: x => x.Bildungsgruppe === 'Gesamt',
    Bundesland: x => x.Bundesland === 'Deutschland'
  }

  options = computed(() => {
    const data = this.data();
    const stratifyBy = this.stratifyBy();

    if (data.length === 0) return {};

    const standard = stratifyBy !== null && ['Bundesland', 'Bildungsgruppe'].includes(stratifyBy) ? 1 : 0
    const variables = uniqBy(data, x => x.Variable).map(x => x.Variable);
    const dataPredicate = filter(this.dataPredicates, (x, k) => k !== stratifyBy).reduce((prev, curr) => {
      return x => prev(x) && curr(x);
    });

    const chartData = data.filter(dataPredicate);
    const stratifiedData = stratifyBy === null ? { 'Gesamt': chartData } : groupBy(chartData, stratifyBy);

    // const groupColors = [] as string[];
    // const groupCount = size(stratifiedData);
    // const hStep = Math.round(300 / (groupCount - 1));
    // for (var i = 0; i < groupCount; i++) {
    //   groupColors.push(echarts.color.modifyHSL('#5A94DF', hStep * i));
    // }

    const seriesData = orderBy(map(stratifiedData, (group, key) => {
      const d  = group.filter(x => x.Standard === ((key !== 'Gesamt' && key !== 'Deutschland') ? standard : 0));
      return { name: key, value: orderBy(d, x => variables.indexOf(x.Variable)).map(x => x.Percent) }
    }), x => `${['Gesamt', 'Deutschland'].includes(x.name) ? ' ' : ''}${x.name}`);

    const options = <EChartsOption>{
      legend: {
        selected: reduce(seriesData, (prev, curr, i) => { prev[curr.name] = i < 4; return prev; }, {} as Record<string, boolean>),
      },
      tooltip: {
        valueFormatter: percentValueFormatter,
        className: 'wrap-tooltip-content'
      },
      // axisPointer: {

      // },
      radar: {
        indicator: map(variables, v => {
          // const variableData = chartData.filter(x => x.Variable === v);
          // const max = (maxBy(variableData, x => x.Percent)?.Percent ?? 0) < 50 ? 50 : 100;

          return { name: v, max: 100 }
        })
      },
      series: {
        type: 'radar',
        name: 'ALLES',
        data: seriesData
        // map(stratifiedData, (group, key) => {
        //   console.log("series data", group)
        //   return { name: key, value: group.filter(x => x.Standard === ((key !== 'Gesamt' && key !== 'Deutschland') ? standard : 0)).map(x => x.Percent) }
        // })

        // [
        //   { value: [50, 39, 20, 2, 54, 23, 54, 65, 76, 87], name: 'Gesamt' },
        //   { value: [50, 39, 20, 2, 54, 23, 54, 65, 76, 87], name: 'Frau' },

        // ]
      }
    }

    console.log("options", options);

    return options;
  });
}
