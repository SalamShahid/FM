import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoryCreatePage } from './category-create.page';

const routes: Routes = [
  {
    path: '',
    component: CategoryCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryCreatePageRoutingModule {}
