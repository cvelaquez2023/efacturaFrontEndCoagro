import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarInvalidacionesComponent } from './listar-invalidaciones.component';

describe('ListarInvalidacionesComponent', () => {
	let component: ListarInvalidacionesComponent;
	let fixture: ComponentFixture<ListarInvalidacionesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListarInvalidacionesComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListarInvalidacionesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
