import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateshareService {

  constructor() { }
  private selectedDate = new BehaviorSubject<any>(new Date().toISOString().split('T')[0]);  
  selectedDate$ = this.selectedDate.asObservable();

  setDate(date: Date) {
    this.selectedDate.next(date); 
  }

  getDate() {
    return this.selectedDate.asObservable(); 
  }

  
  }
  

