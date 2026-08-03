import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticuloBodegaPageComponent } from './add-articulo-bodega-page.component';

describe('AddArticuloBodegaPageComponent', () => {
	let component: AddArticuloBodegaPageComponent;
	let fixture: ComponentFixture<AddArticuloBodegaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddArticuloBodegaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddArticuloBodegaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
