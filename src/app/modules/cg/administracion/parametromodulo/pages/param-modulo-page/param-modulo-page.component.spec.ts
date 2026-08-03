import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamModuloPageComponent } from './param-modulo-page.component';

describe('ParamModuloPageComponent', () => {
	let component: ParamModuloPageComponent;
	let fixture: ComponentFixture<ParamModuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ParamModuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ParamModuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
