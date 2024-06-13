import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  // private _sideNavOpen$ = new BehaviorSubject<boolean>(true);
  // public get sideNavOpen$() {
  //   return this._sideNavOpen$.asObservable();
  // }
  // public get sideNavOpen(): boolean {
  //   return this._sideNavOpen$.value;
  // }
  // public set sideNavOpen(value: boolean) {
  //   this._sideNavOpen$.next(value);
  // }

  constructor() { }
}
