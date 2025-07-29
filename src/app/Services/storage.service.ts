import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dataSubject = new BehaviorSubject<any>(null);
  constructor() { }
  public data$ = this.dataSubject.asObservable();
  setData(key:string,value:any)
  {
    localStorage.setItem(key,JSON.stringify(value));
    this.dataSubject.next({ key, value }); 
  }
  
  getData(key:string):any
  {
    
     var data = JSON.parse(localStorage.getItem(key)??"[]");
     console.log(data);
    return data; 
  }

}