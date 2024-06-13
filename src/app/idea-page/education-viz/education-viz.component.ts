import { Component, computed, input } from '@angular/core';
import { GedaRow } from '../../services/geda-data.service';
import { NgLetModule } from 'ng-let';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { GedaTableComponent } from '../../geda-table/geda-table.component';
import { EChartsOption } from 'echarts';
import { groupBy, head, isNumber, map, maxBy, minBy, orderBy, reduce, uniqBy } from 'lodash-es';
import { getGenderColor } from '../../models/constants';

@Component({
  selector: 'app-education-viz',
  standalone: true,
  imports: [GedaTableComponent, NgxEchartsDirective, NgLetModule],
  templateUrl: './education-viz.component.html',
  styleUrl: './education-viz.component.scss',
  providers: [
    provideEcharts(),
  ]
})
export class EducationVizComponent {
  data = input.required<GedaRow[]>();
  show = input<'radar' | 'gauge'>('radar');

  private readonly genderOrder = ['Gesamt', 'Männer', 'Frauen'];
  private readonly educationOrder = ['Untere', 'Mittlere', 'Obere'];

  chartContext = computed(() => {
    const data = this.data();
    const showRadar = this.show() === 'radar';
    const educationData = data.filter(x => x.Bildungsgruppe !== 'Gesamt' && x.Standard === 1);
    return showRadar ? this._buildRadarOptions(educationData) : this._buildGaugeOptions(educationData);
  })

  private _buildRadarOptions(educationData: GedaRow[]) {
    const eudcationIndicators = orderBy(map(groupBy(educationData, x => x.Bildungsgruppe), (group, k) => {
      let max = maxBy(group, x => x.Percent)?.Percent ?? 0;
      let min = minBy(group, x => x.Percent)?.Percent ?? 0;
      min = Math.max(min - (min * .1), 0);
      max = Math.min(max + (max * .1), 100);

      return { text: k, min, max }
    }), x => this.educationOrder.indexOf(x.text));

    const chartData = map(groupBy(educationData, x => x.Gender), (group, k) => {
      return { name: k, value: eudcationIndicators.map(i => group.find(x => x.Bildungsgruppe === i.text)?.Percent ?? 0) }
    });


    const options = <EChartsOption>{
      color: this.genderOrder.map(x => getGenderColor(x)),
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      radar: {
        indicator: eudcationIndicators
      },
      tooltip: {
        valueFormatter: value => isNumber(value) ? `${value.toFixed(1)}%` : value
      },
      series: [
        {
          type: 'radar',
          data: orderBy(chartData, x => this.genderOrder.indexOf(x.name))
        }
      ]
    }

    return {
      type: 'radar' as const,
      options
    }
  }

  private _buildGaugeOptions(educationData: GedaRow[]) {

    return {
      type: 'gauges' as const,
      options: {
        'Untere': this._buildOptions(educationData, 'Untere'),
        'Mittlere': this._buildOptions(educationData, 'Mittlere'),
        'Obere': this._buildOptions(educationData, 'Obere')
      }
    }
  }


  private readonly _gaugeStyle = {

    pointer: {
      show: false
    },
    progress: {
      show: true,
      overlap: false,
      // roundCap: true,
      clip: false,
      itemStyle: {
        borderWidth: 1,
        borderColor: '#464646'
      }
    },
    axisLine: {
      lineStyle: {
        width: 40
      }
    },
    splitLine: {
      show: false,
      distance: 0,
      length: 10
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false,
      distance: 50
    },
    detail: {
      width: 50,
      height: 14,
      fontSize: 14,
      color: 'inherit',
      formatter: '{value}%'
    }
  }

  private _buildOptions(data: GedaRow[], educationGroup: string) {
    const eduData = data.filter(x => x.Bildungsgruppe === educationGroup);
    const genderGroups = groupBy(eduData, x => x.Gender);

    const lineHeight = 16;
    const gap = 4;

    return <EChartsOption>{
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      title: { text: educationGroup, fontSize: 14 },
      // tooltip: {},
      color: this.genderOrder.map(x => getGenderColor(x)),
      series: [{

        ...this._gaugeStyle,
        type: 'gauge' as const,
        data: orderBy(map(genderGroups, (data, group) => {
          return { group, data };
        }), x => this.genderOrder.indexOf(x.group))
          .map(x => {
            const groupIndex = this.genderOrder.indexOf(x.group);
            return {
              value: head(x.data)?.Percent ?? 0,
              name: x.group,
              title: {
                offsetCenter: [0, `${gap * (groupIndex - 1) + (lineHeight * groupIndex * 2) - lineHeight * 2}%`]
              },
              detail: {
                valueAnimation: true,
                offsetCenter: [0, `${gap * (groupIndex - 1) + (lineHeight * groupIndex * 2) - lineHeight}%`],
                formatter: x => `${x.toFixed(1)}%`
              }
            }
          })
      }]
    }
  }

}
