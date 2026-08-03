import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeCiComponent } from './tree-ci.component';

describe('TreeCiComponent', () => {
	let component: TreeCiComponent;
	let fixture: ComponentFixture<TreeCiComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TreeCiComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeCiComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
