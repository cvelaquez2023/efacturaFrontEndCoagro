import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDtePageComponent } from './lista-dte-page.component';

describe('ListaDtePageComponent', () => {
	let component: ListaDtePageComponent;
	let fixture: ComponentFixture<ListaDtePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListaDtePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListaDtePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
