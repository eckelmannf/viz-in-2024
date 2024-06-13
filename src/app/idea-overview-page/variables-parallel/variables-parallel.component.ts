import { Component, computed, input, model } from '@angular/core';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { GedaTableComponent } from '../../geda-table/geda-table.component';
import { GedaRow } from '../../services/geda-data.service';
import { EChartsOption } from 'echarts';
import { filter, flatMap, groupBy, map, maxBy, minBy, orderBy, reduce, size, take, uniqBy } from 'lodash-es';
import * as echarts from 'echarts';
import { percentValueFormatter } from '../../models/constants';


type StratifyProperties = 'Gender' | 'Bildungsgruppe' | 'Altersgruppe' | 'Bundesland';

@Component({
  selector: 'app-variables-parallel',
  standalone: true,
  templateUrl: './variables-parallel.component.html',
  styleUrl: './variables-parallel.component.scss',
  imports: [NgxEchartsDirective, GedaTableComponent],
  providers: [
    provideEcharts()
  ]
})
export class VariablesParallelComponent {
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

    const standard = stratifyBy !== null && ['Bundesland', 'Bildungsgruppe'].includes(stratifyBy) ? 1 : 0
    const variables = uniqBy(data, x => x.Variable).map(x => x.Variable);
    const dataPredicate = filter(this.dataPredicates, (x, k) => k !== stratifyBy).reduce((prev, curr) => {
      return x => prev(x) && curr(x);
    });

    const chartData = data.filter(dataPredicate);
    const stratifiedData = stratifyBy === null ? { 'Gesamt': chartData } : groupBy(chartData, stratifyBy);

    const groupColors = [] as string[];
    const groupCount = size(stratifiedData);
    const hStep = Math.round(300 / (groupCount - 1));
    for (var i = 0; i < groupCount; i++) {
      groupColors.push(echarts.color.modifyHSL('#5A94DF', hStep * i));
    }

    // const series = orderBy(map(stratifiedData, (x, k) => {
    //   return {
    //     type: 'parallel',
    //     lineStyle: { width: 3 },
    //     name: k,
    //     data: [variables.map(v => x.find(r => r.Variable === v && r.Standard === ((k !== 'Gesamt' && k !== 'Deutschland') ? standard : 0))?.Percent ?? 0)]
    //   }
    // }), x => `${['Gesamt', 'Deutschland'].includes(x.name) ? ' ' : ''}${x.name}`);

    // const options = <EChartsOption>{
    //   legend: {
    //     selected: reduce(series, (prev, curr, i) => { prev[curr.name] = i < 4; return prev; }, {} as Record<string, boolean>),
    //   },
    //   tooltip: {
    //     formatter: (...args) => {
    //       console.log("TT", args);
    //     }
    //   },
    //   parallel: {
    //     layout: 'vertical'
    //   },
    //   parallelAxis: variables.map((x, i) => {
    //     return {
    //       dim: i,
    //       name: x,
    //       min: 0,
    //       max: 100
    //     }
    //   }),
    //   series
    // }

    const series = orderBy(map(stratifiedData, (x, k) => {
      const varData = variables.map(v => {
        const item = x.find(r => r.Variable === v && r.Standard === ((k !== 'Gesamt' && k !== 'Deutschland') ? standard : 0))
        return { x: v, y: item?.Percent ?? 0 }
      });

      return {
        type: 'line' as const,
        name: k,
        data: varData.map(({ x, y }) => [y, x])
      }
    }), x => `${['Gesamt', 'Deutschland'].includes(x.name) ? ' ' : ''}${x.name}`);

    const options: EChartsOption = {
      xAxis: {
        type: 'value',
        position: 'top',
        max: 100
      },
      yAxis: {
        inverse: true,
        type: 'category',
        data: variables
      },
      tooltip: {
        trigger: 'axis',
        valueFormatter: percentValueFormatter
      },
      legend: {
        selected: reduce(series, (prev, curr, i) => { prev[curr.name] = i < 4; return prev; }, {} as Record<string, boolean>),
      },
      series: series
    }

    console.log("options", options);

    return options;
  });
}
