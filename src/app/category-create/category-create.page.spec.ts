import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryCreatePage } from './category-create.page';

describe('CategoryCreatePage', () => {
  let component: CategoryCreatePage;
  let fixture: ComponentFixture<CategoryCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
