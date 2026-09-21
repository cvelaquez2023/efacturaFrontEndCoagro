import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrosModuloPageComponent } from './parametros-modulo-page.component';

describe('ParametrosModuloPageComponent', () => {
	let component: ParametrosModuloPageComponent;
	let fixture: ComponentFixture<ParametrosModuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ParametrosModuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ParametrosModuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
