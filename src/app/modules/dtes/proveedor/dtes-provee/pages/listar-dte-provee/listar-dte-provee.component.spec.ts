import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDteProveeComponent } from './listar-dte-provee.component';

describe('ListarDteProveeComponent', () => {
	let component: ListarDteProveeComponent;
	let fixture: ComponentFixture<ListarDteProveeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListarDteProveeComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListarDteProveeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
