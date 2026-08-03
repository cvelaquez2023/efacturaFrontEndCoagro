import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPagesComponent } from './listar-pages.component';

describe('ListarPagesComponent', () => {
	let component: ListarPagesComponent;
	let fixture: ComponentFixture<ListarPagesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListarPagesComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListarPagesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
