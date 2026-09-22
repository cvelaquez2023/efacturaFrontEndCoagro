import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TreeDteComponent } from "./tree-dte.component";

describe("TreeDteComponent", () => {
  let component: TreeDteComponent;
  let fixture: ComponentFixture<TreeDteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeDteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeDteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
