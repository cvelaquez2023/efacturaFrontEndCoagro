import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtipoComponent } from './subtipo.component';

describe('SubtipoComponent', () => {
	let component: SubtipoComponent;
	let fixture: ComponentFixture<SubtipoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SubtipoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SubtipoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
