import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelPrecioPageComponent } from './nivel-precio-page.component';

describe('NivelPrecioPageComponent', () => {
	let component: NivelPrecioPageComponent;
	let fixture: ComponentFixture<NivelPrecioPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NivelPrecioPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NivelPrecioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
