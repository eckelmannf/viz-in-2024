import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay, tap } from 'rxjs';
import Papa from 'papaparse';
import { filter, find, groupBy, maxBy, reduce, uniq } from 'lodash-es';
import { Dictionary } from 'lodash';

export interface VariableInfo {
  id: string;
  name: string;
  group: string;
  description: string;
  outcome: string;
}

export interface GedaRow {
  Altersgruppe: string;
  Bildungsgruppe: string;
  Gender: string;
  Bundesland: string;
  Standard: number;

  Variable: string;

  Percent: number;
  LowerCL: number;
  UpperCL: number;
}

@Injectable({
  providedIn: 'root',

})
export class GedaDataService {
  private readonly _gedaRawDataUrl = 'https://raw.githubusercontent.com/robert-koch-institut/Gesundheit_in_Deutschland_Aktuell/main/Gesundheit_in_Deutschland_aktuell_-_2019-2020-EHIS.csv';
  private readonly _variableInfoUrl = '/variable-info.json';
  private _http = inject(HttpClient);

  private _standardizeAge$ = new BehaviorSubject<boolean>(false);
  public get standardizeAge$() {
    return this._standardizeAge$.asObservable();
  }
  public get standardizeAge(): boolean {
    return this._standardizeAge$.value;
  }
  public set standardizeAge(value: boolean) {
    this._standardizeAge$.next(value);
  }

  private _selectedVariable$ = new BehaviorSubject<string>('Akrausch');
  public get selecetedVariable$() {
    return this._selectedVariable$.asObservable();
  }
  public get selectedVariable(): string {
    return this._selectedVariable$.value;
  }
  public set selectedVariable(value: string) {
    this._selectedVariable$.next(value);
  }

  private _selectedGender$ = new BehaviorSubject<string>('Gesamt');
  public get selectedGender$() {
    return this._selectedGender$.asObservable();
  }
  public get selectedGender(): string {
    return this._selectedGender$.value;
  }
  public set selectedGender(value: string) {
    this._selectedGender$.next(value);
  }

  private _rawData$ = this._http.get(this._gedaRawDataUrl, { responseType: 'text' })
    .pipe(
      map(raw => {
        const parsed = Papa.parse<GedaRow>(raw, { dynamicTyping: true, header: true, skipEmptyLines: true });
        console.log("PARSED", parsed);
        return parsed.data;
      }),
      shareReplay(1)
    );

  private _filteredData$ = combineLatest({ rawData: this._rawData$, selectedVar: this._selectedVariable$, selectedGender: this._selectedGender$ })
    .pipe(
      map(({ rawData, selectedVar, selectedGender }) => {
        return rawData.filter(x => x.Variable === selectedVar && x.Gender === selectedGender)
      }),
      shareReplay(1)
    );

  private _standardizedData$ = combineLatest({ filteredData: this._filteredData$, standardAge: this._standardizeAge$ })
    .pipe(
      map(({ filteredData, standardAge }) => {
        return filteredData.filter(x => x.Standard === (standardAge ? 1 : 0));
      }),
      shareReplay(1)
    );

  rawData$ = this._rawData$;
  variables$ = this._rawData$.pipe(map(data => uniq(data.map(x => x.Variable))), shareReplay(1));
  variableInfos$ = this._http.get<Record<string, VariableInfo>>(this._variableInfoUrl).pipe(shareReplay(1));

  ageData$ = this._filteredData$.pipe(map(x => {
    return groupBy(x, x => x.Altersgruppe);
  }), tap(x => console.log("age data", x)));
  educationData$ = this._standardizedData$.pipe(map(x => {
    return groupBy(x, x => x.Bildungsgruppe);
  }), tap(x => console.log("education data", x)));
  locationData$ = this._standardizedData$.pipe(map(x => {
    return groupBy(x, x => x.Bundesland);
  }), tap(x => console.log("location data", x)));
  totalMeasure$ = this.ageData$.pipe(map(x => {
    const rows = 'Gesamt' in x ? x['Gesamt'] : [];
    return find(rows, r => r.Bundesland === 'Deutschland' && r.Bildungsgruppe === 'Gesamt')?.Percent ?? 0;
  }));
  ageMeasure$ = this.ageData$.pipe(
    map(data => this._maxCategoryValue(data, 'Gesamt'))
  );
  locationMeasure$ = this.locationData$.pipe(
    map(data => this._maxCategoryValue(data, 'Deutschland'))
  );

  test$ = this._rawData$.pipe(
    map(data => {
      return filter(data, (x: GedaRow) => x.Variable === 'Akrausch' && x.Bildungsgruppe === 'Untere')
    }),
    tap(x => console.log('TEST', x))
  )

  private _maxCategoryValue(data: Dictionary<GedaRow[]>, excludeKey: string): { value: number; category: string; } {
    return reduce(data, (prev, curr, key) => {
      if (key !== excludeKey) {
        const groupMax = maxBy(curr, x => x.Percent)?.Percent ?? 0;
        if (groupMax > prev.value) {
          prev.value = groupMax;
          prev.category = key;
        }
      }
      return prev;
    }, { value: 0, category: '' });
  }
}
