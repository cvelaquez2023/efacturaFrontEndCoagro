import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeClienteComponent } from './tree-cliente.component';

describe('TreeClienteComponent', () => {
	let component: TreeClienteComponent;
	let fixture: ComponentFixture<TreeClienteComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TreeClienteComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeClienteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
