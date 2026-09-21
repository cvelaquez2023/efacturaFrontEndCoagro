import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlArchivosActualizacionesPageComponent } from './control-archivos-actualizaciones-page.component';

describe('ControlArchivosActualizacionesPageComponent', () => {
	let component: ControlArchivosActualizacionesPageComponent;
	let fixture: ComponentFixture<ControlArchivosActualizacionesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ControlArchivosActualizacionesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ControlArchivosActualizacionesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
