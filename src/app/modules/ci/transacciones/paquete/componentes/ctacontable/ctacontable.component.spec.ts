import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtacontableComponent } from './ctacontable.component';

describe('CtacontableComponent', () => {
	let component: CtacontableComponent;
	let fixture: ComponentFixture<CtacontableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CtacontableComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CtacontableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
