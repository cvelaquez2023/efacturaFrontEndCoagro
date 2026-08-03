import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaGeneralPageComponent } from './conta-general-page.component';

describe('ContaGeneralPageComponent', () => {
	let component: ContaGeneralPageComponent;
	let fixture: ComponentFixture<ContaGeneralPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ContaGeneralPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ContaGeneralPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
