import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeUsuarioComponent } from './tree-usuario.component';

describe('TreeUsuarioComponent', () => {
	let component: TreeUsuarioComponent;
	let fixture: ComponentFixture<TreeUsuarioComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TreeUsuarioComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TreeUsuarioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
