import { Component, inject, model } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import * as echarts from 'echarts';
import gerJson from '../../public/ger.geo.json';
import { AppService } from './services/app.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule, MatListModule, AsyncPipe,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
 

  title = 'viz-in-2024';
  private breakpointObserver = inject(BreakpointObserver);
  private _appService = inject(AppService);

  // sideNavOpen = toSignal(this._appService.sideNavOpen$);

  constructor() {
    echarts.registerMap('GER', gerJson as any)
  }

  toggleDrawer() {
    // this._appService.sideNavOpen = !this.sideNavOpen()
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
