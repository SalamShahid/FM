// import { NgModule } from '@angular/core';
// import { Routes, RouterModule } from '@angular/router';

// import { TabsPage } from './tabs.page';

// const routes: Routes = [
//   {
//     path: '',
//     component: TabsPage
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class TabsPageRoutingModule {}
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { FolderPageModule } from '../folder/folder.module';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  //{
    // path: '',
    // component: TabsPage,
  // path: '',
  // redirectTo: 'home', // Default tab
  // pathMatch: 'full',
  {
    path: '',
    component: TabsPage,
    children:[
   
    {
      path: 'home',
      loadChildren: () => import('../folder/folder.module').then( m => m.FolderPageModule)
     
    },
{
path: 'income',
loadChildren: () => import('../income/income.module').then( m => m.IncomePageModule)
},
{
path: 'expense',
loadChildren: () => import('../expense/expense.module').then( m => m.ExpensePageModule)
},
{
path:'',
redirectTo:'home',
pathMatch:'full'
}


]},

// {
//   path: '',
//   redirectTo: 'home', // Default tab
//   pathMatch: 'full'
//}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

