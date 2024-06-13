import { Component, ViewChild, computed, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GedaRow } from '../services/geda-data.service';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-geda-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule],
  templateUrl: './geda-table.component.html',
  styleUrl: './geda-table.component.scss'
})
export class GedaTableComponent {
  private _dataSource = new MatTableDataSource<GedaRow>()

  @ViewChild(MatSort) sort!: MatSort;

  data = input.required<GedaRow[]>();
  displayedColumns = computed(() => {
    const data = this.data();
    return Object.keys(data.length > 0 ? data[0] : {});
  });
  dataSource = computed(() => {
    this._dataSource.data = this.data();
    return this._dataSource;
  });

  ngAfterViewInit() {
    this._dataSource.sort = this.sort;
    // this._dataSource.sortingDataAccessor = (item, headerId) => {
    //   console.log("SORT", item, headerId)
    //   return '';
    // }
  }
}
