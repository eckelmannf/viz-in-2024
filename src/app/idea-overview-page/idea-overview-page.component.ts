import { Component, inject } from '@angular/core';
import { VariablesParallelComponent } from './variables-parallel/variables-parallel.component';
import { GedaDataService } from '../services/geda-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { VariablesRadarComponent } from './variables-radar/variables-radar.component';

@Component({
  selector: 'app-idea-overview-page',
  standalone: true,
  templateUrl: './idea-overview-page.component.html',
  styleUrl: './idea-overview-page.component.scss',
  imports: [VariablesParallelComponent, VariablesRadarComponent, MatSelectModule],
})
export class IdeaOverviewPageComponent {
  private _gedaService = inject(GedaDataService);

  data = toSignal(this._gedaService.rawData$);

}
