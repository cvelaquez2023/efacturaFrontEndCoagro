import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProveedorDteComponent } from './lista-proveedor-dte.component';

describe('ListaProveedorDteComponent', () => {
	let component: ListaProveedorDteComponent;
	let fixture: ComponentFixture<ListaProveedorDteComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListaProveedorDteComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListaProveedorDteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
