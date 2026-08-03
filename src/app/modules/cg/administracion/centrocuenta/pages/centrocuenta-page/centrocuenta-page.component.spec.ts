import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrocuentaPageComponent } from './centrocuenta-page.component';

describe('CentrocuentaPageComponent', () => {
	let component: CentrocuentaPageComponent;
	let fixture: ComponentFixture<CentrocuentaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CentrocuentaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CentrocuentaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
