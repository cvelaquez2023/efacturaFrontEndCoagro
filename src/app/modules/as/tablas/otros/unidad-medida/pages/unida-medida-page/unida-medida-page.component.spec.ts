import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidaMedidaPageComponent } from './unida-medida-page.component';

describe('UnidaMedidaPageComponent', () => {
	let component: UnidaMedidaPageComponent;
	let fixture: ComponentFixture<UnidaMedidaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UnidaMedidaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UnidaMedidaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
