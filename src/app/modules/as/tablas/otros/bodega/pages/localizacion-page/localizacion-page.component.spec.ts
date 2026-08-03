import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizacionPageComponent } from './localizacion-page.component';

describe('LocalizacionPageComponent', () => {
	let component: LocalizacionPageComponent;
	let fixture: ComponentFixture<LocalizacionPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LocalizacionPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LocalizacionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
