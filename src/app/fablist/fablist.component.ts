import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fablist',
  templateUrl: './fablist.component.html',
  styleUrls: ['./fablist.component.scss'],
  standalone:true,
  imports: [IonicModule,CommonModule],
  encapsulation: ViewEncapsulation.None
  
})
export class FablistComponent  implements OnInit {
  isFabOpen:boolean=false;

  constructor(private router:Router) { }

  ngOnInit() {}
  ngAfterViewInit() {
  setTimeout(() => {
    const tabBar = document.querySelector('ion-tab-bar');
    const fab = document.querySelector('ion-fab.fab-button') as HTMLElement;

    if (tabBar && fab) {
      const tabBarHeight = tabBar.clientHeight;
      fab.style.bottom = `${tabBarHeight - 24}px`; 
      fab.style.right = `16px`;
    }
  }, 300); 
}
  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }
  Analytics(){
    this.isFabOpen = false;
    this.router.navigate(['/analytics'])

  }
  Budget(){
    this.isFabOpen = false;
    this.router.navigate(['/budget'])
  }
}


