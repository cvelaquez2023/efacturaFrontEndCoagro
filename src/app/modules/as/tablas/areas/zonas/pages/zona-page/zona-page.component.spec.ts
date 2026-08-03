import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonaPageComponent } from './zona-page.component';

describe('ZonaPageComponent', () => {
	let component: ZonaPageComponent;
	let fixture: ComponentFixture<ZonaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ZonaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ZonaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
