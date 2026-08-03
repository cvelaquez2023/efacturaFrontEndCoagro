import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaarticuloPageComponent } from './categoriaarticulo-page.component';

describe('CategoriaarticuloPageComponent', () => {
	let component: CategoriaarticuloPageComponent;
	let fixture: ComponentFixture<CategoriaarticuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CategoriaarticuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CategoriaarticuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
