import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import {ElementRef} from '@angular/core'
import { ObservableService } from '../Services/observable.service';
import { DateshareService } from '../Services/dateshare.service';
import { FormInterface } from '../Interfaces/formInterface';
import { StorageService } from '../Services/storage.service';
import { reduce } from 'rxjs';
import { HighlightedDates } from '../Interfaces/highlightdate';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  highlightedDatesMap: { [key: string]: { textColor: string; backgroundColor: string } } = {};
  @ViewChild(IonContent, { static: false }) content!: IonContent ;
  @ViewChild('calendarCard', { read: ElementRef }) calendarCard!: ElementRef;
  @ViewChild('calendarIcon', { read: ElementRef }) calendarIcon!: ElementRef;
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  selectedDate:any;
  isCalendarHidden:boolean=false;
  expenseformdeets:any;
  dateSame:boolean=false;
  expenses: FormInterface[] = [];
  incomes:FormInterface[]=[];
  
  incomeAndExpense:FormInterface[]=[];
  
  filteredExpenses: FormInterface[]=[];;
  count:number=0;

  constructor(private expenseformdetails:ObservableService, private animationCtrl: AnimationController,
    private dateService: DateshareService,private storageservice:StorageService,private router:Router) {}
  ionViewWillEnter(){
    this.dateService.getDate().subscribe
    (date => this.selectedDate=date
  ) 
  this.generateHighlightedDates();
  }

  ngOnInit() {
    this.expenses=this.storageservice.getData('expense');
    this.incomes=this.storageservice.getData('income');
    this.expenses.forEach(element => {
      var k=this.incomeAndExpense.push(element);
      console.log("expenses pushed in combined array: ",k)
    });
    this.incomes.forEach(element => {
      var v=this.incomeAndExpense.push(element);
      console.log("incomes pushed in combined array: ",v)
    });   
}

generateHighlightedDates() {
  const countMap: { [key: string]: number } = {};

this.incomeAndExpense.forEach(element => {

    const dateKey = new Date(element.date).toISOString().split('T')[0];
    countMap[dateKey] = (countMap[dateKey] || 0) + 1;
  });

    
Object.keys(countMap).forEach(date => {
  const counting = countMap[date];

  if (counting > 10) {
    this.highlightedDatesMap[date] = { textColor: 'white', backgroundColor: 'green' };
  } else if (counting > 5) {
    this.highlightedDatesMap[date] = { textColor: 'black', backgroundColor: 'lightgreen' };
  } else if (counting > 0) {
    this.highlightedDatesMap[date] = { textColor: 'black', backgroundColor: 'pink' };
  }
});

console.log("Highlighted Dates:", this.highlightedDatesMap);
}

highlightedDates = (isoString: string) => {
  const dateKey = new Date(isoString).toISOString().split('T')[0];
  return this.highlightedDatesMap[dateKey] || undefined;
};
    

  filterExpenses() {
    this.filteredExpenses = this.expenses.filter(exp => exp.date === this.selectedDate);
    console.log("Filtered expenses" + this.filteredExpenses);
  }

  
  onDateChange(value: any) {
  setTimeout(async () => {
    await this.shrinkCalendarToIcon();
  }, 300);
    this.selectedDate=this.dateService.setDate(value);
    var formatedvalue=new Date(value).toISOString().split('T')[0];
    console.log("Date calender"+" : "+ formatedvalue);
    console.log("Is date same?",this.dateSame);
    if (this.selectedDate === value) {
      return; // Ignore duplicate selection
    }
    this.selectedDate = value;
    this.isCalendarHidden=true;
    this.scrollToTop();
    console.log("selected date is"+" : "+this.selectedDate);
    this.expenses.forEach(element => {
     if(element.date==this.selectedDate){
       this.count++;    
       console.log(element);
       this.dateSame=true;    
     }
   });
   console.log("the date and the count of entries:"+" "+this.selectedDate,this.count);
  
  }

scrollToTop(){
  this.content.scrollToPoint(0, 200, 500);
}
async hideCalendar(){
  this.isCalendarHidden = true;}
  async toggleCalendar() {
  if (this.isCalendarHidden) {
    this.isCalendarHidden = false;
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const calendar = this.calendarCard?.nativeElement;
    if (calendar) {
      const animation = this.animationCtrl.create()
        .addElement(calendar)
        .duration(300)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'scale(0.8)', 'scale(1)');
      
      await animation.play();
    }
  } else {
    await this.shrinkCalendarToIcon();
  }
}
async shrinkCalendarToIcon() {
  const calendar = this.calendarCard?.nativeElement;
  if (calendar) {
    const animation = this.animationCtrl.create()
      .addElement(calendar)
      .duration(500) 
      .easing('cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      .fromTo('transform', 'scale(1)', 'scale(0.1)')
      .fromTo('opacity', '1', '0.3')
      .fromTo('border-radius', '8px', '50px');
    
    await animation.play();
    this.isCalendarHidden = true;
  }
}
EditExpense(id:number,dateInEdit:string){
 this.router.navigate(['/tabs/expense', {editValue: id,dateValue:dateInEdit}]);
   
}
EditIncome(id:number,dateInEdit:string){
  this.router.navigate(['/tabs/income', {editValue: id,dateValue:dateInEdit}]);
}
 
}




