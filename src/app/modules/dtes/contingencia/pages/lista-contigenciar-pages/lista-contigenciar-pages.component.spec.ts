import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaContigenciarPagesComponent } from './lista-contigenciar-pages.component';

describe('ListaContigenciarPagesComponent', () => {
	let component: ListaContigenciarPagesComponent;
	let fixture: ComponentFixture<ListaContigenciarPagesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ListaContigenciarPagesComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ListaContigenciarPagesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
