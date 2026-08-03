import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaclientePageComponent } from './categoriacliente-page.component';

describe('CategoriaclientePageComponent', () => {
	let component: CategoriaclientePageComponent;
	let fixture: ComponentFixture<CategoriaclientePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CategoriaclientePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CategoriaclientePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
