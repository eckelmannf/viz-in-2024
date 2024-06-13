import { Component, computed, input } from '@angular/core';
import { EChartsOption } from 'echarts';
import { find } from 'lodash-es';
import { GedaRow } from '../../services/geda-data.service';
import { NgxEchartsDirective, NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import { NgLetModule } from 'ng-let';
import { getGenderColor, getGenderShadow } from '../../models/constants';

@Component({
  selector: 'app-gender-gauges',
  standalone: true,
  templateUrl: './gender-gauges.component.html',
  styleUrl: './gender-gauges.component.scss',
  imports: [NgxEchartsDirective, NgLetModule],
  providers: [
    provideEcharts()
  ]
})
export class GenderGaugesComponent {
  data = input.required<GedaRow[]>();
  bundeslandFilter = input<string | null>();

  totalOptions = computed(() => {
    const data = this.data();
    const bundeslandFilter = this.bundeslandFilter();

    const chartData = data.filter(x => x.Altersgruppe === 'Gesamt' && x.Bildungsgruppe === 'Gesamt' && x.Bundesland === (bundeslandFilter ?? 'Deutschland'));
    const totalData = find(chartData, x => x.Gender === 'Gesamt');
    const femaleData = find(chartData, x => x.Gender === 'Frauen');
    const maleData = find(chartData, x => x.Gender === 'Männer');

    const total = this._buildGaugeOption(totalData);
    const female = this._buildGaugeOption(femaleData);
    const male = this._buildGaugeOption(maleData);

    return { total, female, male }
  });

  private _buildGaugeOption(data: GedaRow | undefined): EChartsOption {
    const gender = data?.Gender ?? '';
    const color = getGenderColor(gender);
    const shadowColor = getGenderShadow(gender);

    return {
      // grid: { top: 0, bottom: -300 },
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,

          splitNumber: 10,
          itemStyle: {
            color,
            shadowColor,
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2
          },
          progress: {
            show: true,
          },
          pointer: {
            width: 0,
          },
          title: {
            show: false
          },
          detail: {
            lineHeight: 16,
            offsetCenter: [0, -16],
            valueAnimation: true,
            formatter: function (value) {
              const fixed = value.toFixed(1);
              console.log("FORMATTER", value, fixed)
              return `{label|${data?.Gender ?? ''}}\n\n{value|${value.toFixed(1)}%}`;
            },
            rich: {
              value: {
                fontSize: 30,
                fontWeight: 'bold',
                color: '#777'
              },
              label: {
                fontSize: 25,
                color: '#777'
              }
            }
          },
          data: [
            {
              value: data?.Percent ?? 0
            }
          ]
        }
      ]
    };
  }
}
