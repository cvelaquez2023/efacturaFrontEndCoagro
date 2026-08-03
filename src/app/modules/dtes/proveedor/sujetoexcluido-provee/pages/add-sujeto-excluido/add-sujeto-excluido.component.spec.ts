import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSujetoExcluidoComponent } from './add-sujeto-excluido.component';

describe('AddSujetoExcluidoComponent', () => {
	let component: AddSujetoExcluidoComponent;
	let fixture: ComponentFixture<AddSujetoExcluidoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddSujetoExcluidoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddSujetoExcluidoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
