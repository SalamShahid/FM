import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { FormInterface } from '../Interfaces/formInterface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ObservableService {
 constructor() { }
  private expensesSubject = new BehaviorSubject<FormInterface[]>([]); // Stores the list of expenses
  expenses$ = this.expensesSubject.asObservable(); // Expose as Observable

  addExpense(newExpense: FormInterface) {
    const currentExpenses = this.expensesSubject.getValue();
    const updatedExpenses = [...currentExpenses, newExpense]; // Add the new expense
    this.expensesSubject.next(updatedExpenses); // Notify all subscribers
  }

  // Retrieve latest expenses
  getExpenses(): FormInterface[] {
    return this.expensesSubject.getValue();
  }
}

  

