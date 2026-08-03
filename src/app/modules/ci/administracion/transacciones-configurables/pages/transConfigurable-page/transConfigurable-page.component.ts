import { AddTransconfigurablePageComponent } from './../add-transconfigurable-page/add-transconfigurable-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseTransConfigurable } from './../../model/transConfigurable-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { TransConfigurableApiService } from './../../service/transConfigurable-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService } from 'ng-snotify';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'app-transConfigurable-page',
	templateUrl: './transConfigurable-page.component.html',
	styleUrls: ['./transConfigurable-page.component.scss']
})
export class TransConfigurablePageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _transConfigurableApiService: TransConfigurableApiService
	) {}

	listAjuste = new MatTableDataSource<IResponseTransConfigurable>();
	displayedColumns: string[] = ['codAjuste', 'descripcion', 'ajusteBase', 'activa', 'ingreso', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';

	ngOnInit(): void {
		this._loadAjuste(1, 10000);
	}
	ngAfterViewInit(): void {
		this.listAjuste.paginator = this.paginator;
		this.listAjuste.sort = this.sort;
	}

	private _loadAjuste(page: number, rows: number): void {
		this._transConfigurableApiService.getTranConfig(page, rows).subscribe({
			next: (response) => {
				console.log(response);
				this.listAjuste.data = response.result;
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listAjuste.filter = filterValue.trim().toLowerCase();
	}
	openDialog(): void {
		this._dialog
			.open(AddTransconfigurablePageComponent, {
				autoFocus: false,
				maxHeight: '90vh'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadAjuste(1, 10000);
				}
			});
	}
	clickDelete(): void {
		console.log('borrar');
	}
	clickEdit(): void {
		console.log('editar');
	}
}
