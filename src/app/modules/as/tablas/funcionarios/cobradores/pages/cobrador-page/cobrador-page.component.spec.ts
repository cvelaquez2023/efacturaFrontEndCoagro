import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobradorPageComponent } from './cobrador-page.component';

describe('CobradorPageComponent', () => {
	let component: CobradorPageComponent;
	let fixture: ComponentFixture<CobradorPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CobradorPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CobradorPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
