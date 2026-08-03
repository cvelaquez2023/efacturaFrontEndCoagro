import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsubtipoComponent } from './subsubtipo.component';

describe('SubsubtipoComponent', () => {
	let component: SubsubtipoComponent;
	let fixture: ComponentFixture<SubsubtipoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SubsubtipoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SubsubtipoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
