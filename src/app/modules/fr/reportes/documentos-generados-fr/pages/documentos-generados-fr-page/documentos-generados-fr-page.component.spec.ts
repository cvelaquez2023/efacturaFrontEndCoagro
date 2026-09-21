import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosGeneradosFrPageComponent } from './documentos-generados-fr-page.component';

describe('DocumentosGeneradosFrPageComponent', () => {
	let component: DocumentosGeneradosFrPageComponent;
	let fixture: ComponentFixture<DocumentosGeneradosFrPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DocumentosGeneradosFrPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DocumentosGeneradosFrPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
