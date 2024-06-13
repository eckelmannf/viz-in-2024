import { Component, inject } from '@angular/core';
import { GedaDataService } from '../services/geda-data.service';
import { map } from 'rxjs';
import { groupBy, map as lmap } from 'lodash-es';
import { toSignal } from '@angular/core/rxjs-interop';
import { VariableVizComponent } from './variable/variable.component';

@Component({
  selector: 'app-idea-page',
  standalone: true,
  imports: [VariableVizComponent],
  templateUrl: './idea-page.component.html',
  styleUrl: './idea-page.component.scss'
})
export class IdeaPageComponent {
  private _gedaService = inject(GedaDataService);

  private _sections$ = this._gedaService.variableInfos$.pipe(map(vars => {
    return lmap(groupBy(lmap(vars, x => x), x => x.group), (x, k) => ({ name: k, parts: x }));
  }));

  sections = toSignal(this._sections$);
}
