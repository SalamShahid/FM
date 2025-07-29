import { Component, inject, OnInit } from '@angular/core';
import { Categories } from '../Interfaces/categories';
import { StorageService } from '../Services/storage.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.page.html',
  styleUrls: ['./category-create.page.scss'],
  standalone: false,
})
export class CategoryCreatePage implements OnInit {
  constructor(private router:Router,private route: ActivatedRoute) { }
  subject = new Subject<Categories[]>();
  storageservices: StorageService=inject(StorageService);
  selectedicon:string="";
  addCategorySource:string=''
  iconTouched = false;
  ngOnInit() {
     this.route.queryParams.subscribe(params => {
     this.addCategorySource=params['createCategorySource'];
    console.log(params['createCategorySource']); // books
  });
  }
  categoryNew:Categories[]=[];
  icons = [
    "american-football-outline", "barbell-outline", "bandage-outline", "bed-outline",
    "beer-outline", "bicycle-outline", "boat-outline", "book-outline", "bus-outline",
    "business-outline", "car-sport-outline", "color-palette-outline", "diamond-outline",
    "dice-outline", "game-controller-outline", "home-outline", "newspaper-outline",
    "print-outline", "subway-outline", "watch-outline", "ticket-outline"
  ];
createcategoryform:Categories={
  id:0,
  name:"",
  icon:'',
  value:""
} 
isChevronUp = false;
createcategories:Categories[]=[];
selectedIcon: string = '';
selectingIcon(icon:string)
{
this.iconTouched = true;
this.selectedicon=icon;
this.createcategoryform.icon=this.selectedicon;
console.log(this.createcategoryform);

}

createCategory(){

  if(this.addCategorySource=='expense'){
  this.categoryNew=this.storageservices.getData('categories');}
  else if (this.addCategorySource=='income') {
  this.categoryNew=this.storageservices.getData('incomecategories'); }
  else if (this.addCategorySource=='budget'){
  this.categoryNew=this.storageservices.getData('budgetcategories');}
  else {
    console.log("no category added");
    
  } 
  console.log("new category added",this.categoryNew);
  this.createcategoryform.id=this.categoryNew.length+1;
  if(this.createcategoryform.name==""){
    
    this.createcategoryform.name=this.selectedicon;
    this.createcategoryform.value=this.selectedicon;
    console.log("value in if",this.createcategoryform.value);
    console.log("name in if",this.createcategoryform.name);
  }
  else{
    this.createcategoryform.value=this.createcategoryform.name;
    console.log("value in else",this.createcategoryform.value);
    }
    if(this.createcategoryform.icon!='' && this.createcategoryform.name!=''){
    this.categoryNew.push(this.createcategoryform)
    this.subject.next(this.categoryNew);
    }
 
  if(this.addCategorySource=='expense')
  {this.storageservices.setData('categories',this.categoryNew);
    this.router.navigateByUrl('/tabs/expense');
  }
  else if(this.addCategorySource=='income'){this.storageservices.setData('incomecategories',this.categoryNew);
    this.router.navigateByUrl('/tabs/income');
  }
  else if(this.addCategorySource=='budget'){
    this.storageservices.setData('budgetcategories',this.categoryNew);
    this.router.navigateByUrl('/budget');
  }

}
}







