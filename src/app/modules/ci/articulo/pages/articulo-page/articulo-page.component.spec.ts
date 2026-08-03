import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticuloPageComponent } from './articulo-page.component';

describe('ArticuloPageComponent', () => {
	let component: ArticuloPageComponent;
	let fixture: ComponentFixture<ArticuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ArticuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ArticuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
