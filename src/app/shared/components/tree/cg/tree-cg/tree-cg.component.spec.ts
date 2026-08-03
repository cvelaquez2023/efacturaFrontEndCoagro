import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeCgComponent } from './tree-cg.component';

describe('TreeCgComponent', () => {
	let component: TreeCgComponent;
	let fixture: ComponentFixture<TreeCgComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TreeCgComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeCgComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
