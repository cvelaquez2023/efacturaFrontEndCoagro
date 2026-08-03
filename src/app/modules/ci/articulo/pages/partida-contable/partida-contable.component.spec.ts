import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidaContableComponent } from './partida-contable.component';

describe('PartidaContableComponent', () => {
	let component: PartidaContableComponent;
	let fixture: ComponentFixture<PartidaContableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PartidaContableComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PartidaContableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
