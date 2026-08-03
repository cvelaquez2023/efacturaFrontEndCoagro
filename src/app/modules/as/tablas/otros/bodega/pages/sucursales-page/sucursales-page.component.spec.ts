import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalesPageComponent } from './sucursales-page.component';

describe('SucursalesPageComponent', () => {
	let component: SucursalesPageComponent;
	let fixture: ComponentFixture<SucursalesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SucursalesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SucursalesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
