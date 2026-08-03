import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionpagoPageComponent } from './condicionpago-page.component';

describe('CondicionpagoPageComponent', () => {
	let component: CondicionpagoPageComponent;
	let fixture: ComponentFixture<CondicionpagoPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CondicionpagoPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CondicionpagoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
