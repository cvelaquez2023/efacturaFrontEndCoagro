import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtrocostoComponent } from './ctrocosto.component';

describe('CtrocostoComponent', () => {
	let component: CtrocostoComponent;
	let fixture: ComponentFixture<CtrocostoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CtrocostoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CtrocostoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
