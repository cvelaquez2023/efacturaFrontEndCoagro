import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeProveedorComponent } from './tree-proveedor.component';

describe('TreeProveedorComponent', () => {
	let component: TreeProveedorComponent;
	let fixture: ComponentFixture<TreeProveedorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TreeProveedorComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeProveedorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
