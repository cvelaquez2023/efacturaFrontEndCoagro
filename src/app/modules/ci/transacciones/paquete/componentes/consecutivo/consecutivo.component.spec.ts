import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsecutivoComponent } from './consecutivo.component';

describe('ConsecutivoComponent', () => {
	let component: ConsecutivoComponent;
	let fixture: ComponentFixture<ConsecutivoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConsecutivoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConsecutivoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
