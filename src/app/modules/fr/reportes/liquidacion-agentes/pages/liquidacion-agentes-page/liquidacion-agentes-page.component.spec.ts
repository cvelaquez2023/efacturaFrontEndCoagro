import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionAgentesPageComponent } from './liquidacion-agentes-page.component';

describe('LiquidacionAgentesPageComponent', () => {
	let component: LiquidacionAgentesPageComponent;
	let fixture: ComponentFixture<LiquidacionAgentesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LiquidacionAgentesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LiquidacionAgentesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
