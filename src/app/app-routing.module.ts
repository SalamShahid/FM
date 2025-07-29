// import { NgModule } from '@angular/core';
// import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'folder/inbox',
//     pathMatch: 'full'
//   },
//   {
//     path: 'folder/:id',
//     loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
//   },
//   {
//     path: 'tabs',
//     loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
//   }
// ];

// @NgModule({
//   imports: [
//     RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
//   ],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FolderPageModule } from './folder/folder.module';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',  
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  // {
  //   path: 'category-create',
  //   loadChildren: () => import('./category-create/category-create.module').then( m => m.CategoryCreatePageModule)
  // },
  // {
  //   path: 'analytics',
  //   loadChildren: () => import('./analytics/analytics.module').then( m => m.AnalyticsPageModule)
  // },
  // {
  //   path: 'budget',
  //   loadChildren: () => import('./budget/budget.module').then( m => m.BudgetPageModule)
  // },
  {
    path: 'income',
    loadChildren: () => import('./income/income.module').then( m => m.IncomePageModule)
  },
  {
    path: 'expense',
    loadChildren: () => import('./expense/expense.module').then( m => m.ExpensePageModule)
  },
  {
    path: 'category-create',
    loadChildren: () => import('./category-create/category-create.module').then( m => m.CategoryCreatePageModule)
  },
 
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
