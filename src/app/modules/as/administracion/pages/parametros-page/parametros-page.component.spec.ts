import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrosPageComponent } from './parametros-page.component';

describe('ParametrosPageComponent', () => {
	let component: ParametrosPageComponent;
	let fixture: ComponentFixture<ParametrosPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ParametrosPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ParametrosPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
