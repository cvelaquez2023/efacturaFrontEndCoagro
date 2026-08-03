import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcondicionpagoPageComponent } from './addcondicionpago-page.component';

describe('AddcondicionpagoPageComponent', () => {
	let component: AddcondicionpagoPageComponent;
	let fixture: ComponentFixture<AddcondicionpagoPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddcondicionpagoPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddcondicionpagoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
