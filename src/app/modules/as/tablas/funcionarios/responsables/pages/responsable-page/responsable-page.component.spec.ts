import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsablePageComponent } from './responsable-page.component';

describe('ResponsablePageComponent', () => {
	let component: ResponsablePageComponent;
	let fixture: ComponentFixture<ResponsablePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ResponsablePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ResponsablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
