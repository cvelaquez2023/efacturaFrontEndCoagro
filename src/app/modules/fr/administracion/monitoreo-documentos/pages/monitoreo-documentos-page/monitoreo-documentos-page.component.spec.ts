import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoDocumentosPageComponent } from './monitoreo-documentos-page.component';

describe('MonitoreoDocumentosPageComponent', () => {
	let component: MonitoreoDocumentosPageComponent;
	let fixture: ComponentFixture<MonitoreoDocumentosPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MonitoreoDocumentosPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MonitoreoDocumentosPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
