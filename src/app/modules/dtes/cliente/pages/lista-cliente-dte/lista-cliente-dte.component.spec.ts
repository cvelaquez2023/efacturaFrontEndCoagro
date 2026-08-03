import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaClienteDteComponent } from './lista-cliente-dte.component';

describe('ListaClienteDteComponent', () => {
	let component: ListaClienteDteComponent;
	let fixture: ComponentFixture<ListaClienteDteComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListaClienteDteComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListaClienteDteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
