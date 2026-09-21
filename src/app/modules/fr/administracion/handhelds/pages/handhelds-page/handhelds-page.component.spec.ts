import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandheldsPageComponent } from './handhelds-page.component';

describe('HandheldsPageComponent', () => {
	let component: HandheldsPageComponent;
	let fixture: ComponentFixture<HandheldsPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HandheldsPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(HandheldsPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
