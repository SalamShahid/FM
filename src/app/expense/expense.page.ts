import { Component, inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DateshareService } from '../Services/dateshare.service';
import { FormInterface } from '../Interfaces/formInterface';
import { StorageService } from '../Services/storage.service';
import { ObservableService } from '../Services/observable.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Categories } from '../Interfaces/categories';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FilterInterface } from '../Interfaces/filterInterface';
import { AnimationController, IonModal, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
  standalone: false,
})
export class ExpensePage implements OnInit, OnDestroy {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  editId: any;
  dateValue: string = '';
  selectedSegment: string = 'all';
  
  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private expenseformdetails: ObservableService,
    private dateService: DateshareService,
    private animationCtrl: AnimationController,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private modalController: ModalController
  ) {}

  private categorysubject = new Subject<Categories>();
  displayList: FormInterface[] = [];
  favCategories: Categories[] = [];
  allCategories: Categories[] = [];
  favouritecategory: Categories[] = [];
  isFilterApplied: boolean = false;
  activeView: string = 'amount';
  maxFavourites = 6;
  selectectedRange: { lower: number; upper: number } = { lower: 0, upper: 0 };
  
  filters: FilterInterface = {
    amountMin: 0,
    amountMax: 0,
    category: [],
    inflowOroutflow: [],
    dateFrom: "",
    dateTo: "",
    note: []
  };
  
  filteredExpenseList: FormInterface[] = [];
  storageservices: StorageService = inject(StorageService);
  
  expenseForm: FormInterface = {
    Id: 1,
    amount: "",
    inflowOroutflow: "",
    category: "",
    iconName: "",
    date: "",
    note: ""
  };
  
  Expense: FormInterface[] = [];
  expenselist: FormInterface[] = [];
  masterCategories: Categories[] = [];
  filteredExpenses: FormInterface[] = [];
  count: number = 0;
  isChevronUp = false;
  categorycard: boolean = false;
  selectedCategory = '';
  selectedIcon: string = "grid-outline";
  isCalendarHidden: boolean = false;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedSets: { [key: string]: Set<string> } = {
    inflowOroutflow: new Set(),
    category: new Set(),
    note: new Set()
  };
  
  selectedButton: string | null = null;
  selectedButtons: Set<string> = new Set();
  priceRange = { lower: 0, upper: 100000 };
  ngAfterViewInit() {
    // Ensure modal is properly initialized after view is ready
    if (this.modal) {
      console.log('Modal initialized');
    }
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter called');
    
    
    this.resetFormState();
    
   
    this.editId = this.activatedroute.snapshot.paramMap.get('editValue') ?? "";
    this.dateValue = this.activatedroute.snapshot.paramMap.get('dateValue') ?? "";
    
    console.log('Edit ID:', this.editId);
    console.log('Date Value:', this.dateValue);
    
    
    this.initializeData();
    
   
    const categorySubscription = this.categorysubject.subscribe((category) => {
      console.log("Category updated:", category);
    });
    this.subscriptions.push(categorySubscription);
    
    this.masterCategories = this.storageservices.getData('categories') || [];
    
    
    this.loadExpenses();
    this.updateDisplayList();
  }

  ngOnInit() {
    
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    if (this.modal) {
      this.modal.dismiss();
    }
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  
  private resetFormState() {
    // Reset form to default state
    this.expenseForm = {
      Id: 1,
      amount: "",
      inflowOroutflow: "",
      category: "",
      iconName: "",
      date: new Date().toISOString().split('T')[0], // Always set to today by default
      note: ""
    };
    
    
    this.selectedCategory = '';
    this.selectedIcon = "grid-outline";
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.categorycard = false;
    this.isChevronUp = false;
    
    console.log('Form state reset, default date set to:', this.expenseForm.date);
  }

  private initializeData() {
    this.expenselist = this.storageservices.getData('expense') ?? [];
    console.log('Loaded expense list:', this.expenselist);
    this.displayList = [...this.expenselist];
    
    
    if (this.editId && this.editId !== "") {
      this.Expense = this.storageservices.getData('expense') || [];
      const editItem = this.Expense.find((obj) => obj.Id == parseInt(this.editId));
      
      if (editItem) {
        
        this.expenseForm = { ...editItem }; // Create a copy
        this.selectedCategory = editItem.category || '';
        this.selectedIcon = editItem.iconName || "grid-outline";
        this.selectedDate = editItem.date || new Date().toISOString().split('T')[0];
        
        console.log('Edit mode - loaded item:', editItem);
        console.log('Form populated with:', this.expenseForm);
      }
    } else if (this.dateValue && this.dateValue !== '') {
      
      this.selectedDate = this.dateValue;
      this.expenseForm.date = this.dateValue;
      console.log('Date mode - set date to:', this.dateValue);
    }

    this.initializeCategories();
  }

  private setupSubscriptions() {
   
    const storageSubscription = this.storageservices.data$.subscribe(data => {
      if (data?.key === 'expense' && Array.isArray(data.value)) {
        this.expenselist = data.value;
        this.updateDisplayList();
      } else if (data?.key === 'expense' && data.value) {
        this.expenselist = [...this.expenselist, data.value];
        this.updateDisplayList();
      }
    });
    this.subscriptions.push(storageSubscription);

    
    const expenseSubscription = this.expenseformdetails.expenses$.subscribe(expenses => {
      console.log("Received expenses from observable service:", expenses);
      this.updateDisplayList();
    });
    this.subscriptions.push(expenseSubscription);
  }

  private initializeCategories() {
    const all = this.storageservices.getData('categories');
    const favs = this.storageservices.getData('favourites');
    
    if (!all || all.length === 0) {
      const defaultCategories: Categories[] = [
        { id: 1, name: 'Add Category', icon: 'create-outline', value: 'new' },
        { id: 2, name: 'Food & Drink', icon: 'fast-food-outline', value: 'salary' },
        { id: 3, name: 'Shopping', icon: 'cart-outline', value: 'shopping' },
        { id: 4, name: 'Transport', icon: 'bus-outline', value: 'transport' },
        { id: 5, name: 'Home', icon: 'home-outline', value: 'home' },
        { id: 6, name: 'Entertainment', icon: 'film-outline', value: 'entertaintment' },
        { id: 7, name: 'Bills & Fees', icon: 'cash-outline', value: 'bills' },
        { id: 8, name: 'Healthcare', icon: 'medkit-outline', value: 'healthcare' },
        { id: 9, name: 'Education', icon: 'school-outline', value: 'education' },
        { id: 10, name: 'Travel', icon: 'airplane-outline', value: 'travel' },
      ];
      this.storageservices.setData('categories', defaultCategories);
      this.allCategories = defaultCategories;
    } else {
      this.allCategories = all;
    }
    this.favouritecategory = favs || [];
  }

  
  private updateDisplayList() {
    if (this.isFilterApplied) {
      this.displayList = [...this.filteredExpenseList];
    } else {
      this.displayList = [...this.expenselist];
    }
    console.log("Display list updated:", this.displayList);
  }

  
  loadExpenses() {
    this.expenselist = this.storageservices.getData('expense') || [];
    console.log("Loaded Expenses:", this.expenselist);
    this.updateDisplayList();
  }

  trackById(index: number, item: any): number {
    return item.Id;
  }

  selectedview(view: string) {
    if (this.activeView !== view) {
      this.activeView = view;
    }
  }

  selectCategory(category: string, icon: string) {
    if (icon == "create-outline") {
      this.modalController.dismiss({
        dismissed: true
      });
      this.router.navigate(['/category-create'], {
        queryParams: { createCategorySource: 'expense' }
      });
      return;
    }
    this.selectedCategory = category ?? "";
    this.selectedIcon = icon;
    this.expenseForm.category = category;
    this.expenseForm.iconName = icon;
    console.log('Selected category:', category, 'Selected date:', this.selectedDate);
  }

  inputclick() {
    this.categorycard = true;
     this.openModal();
  }

  toggleCalendar() {
    this.isCalendarHidden = !this.isCalendarHidden;
  }

  onDateChange(value: any) {
    if (this.selectedDate === value) {
      return;
    }
    this.selectedDate = value;
    this.expenseForm.date = value;
    console.log("Date changed to:", value);
  }

  Save(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    
    console.log("Saving expense form:", this.expenseForm);
    
    
    if (!this.expenseForm.date) {
      this.expenseForm.date = this.selectedDate || new Date().toISOString().split('T')[0];
    }

    
    if (this.editId === "" || !this.editId) {
      // Create new expense
      this.Expense = this.storageservices.getData('expense') || [];
      
      
      const maxId = this.Expense.length > 0 ? Math.max(...this.Expense.map(e => e.Id)) : 0;
      this.expenseForm.Id = maxId + 1;
      
      this.Expense.push({ ...this.expenseForm });
      this.storageservices.setData('expense', this.Expense);
      
      console.log('Created new expense:', this.expenseForm);
    } else {
      
      const storedData: FormInterface[] = this.storageservices.getData('expense') || [];
      const index = storedData.findIndex((obj) => obj.Id == parseInt(this.editId));
      
      if (index !== -1) {
        storedData[index] = { ...this.expenseForm };
        this.storageservices.setData('expense', storedData);
        console.log('Updated expense at index:', index, this.expenseForm);
      }
    }

    
    this.expenseformdetails.addExpense({ ...this.expenseForm });
    
    
    this.loadExpenses();
    
    
    this.resetFormAfterSave(form);
    
    
    this.selectedSegment = 'view';
    
    console.log('Save completed successfully');
  }

  
  private resetFormAfterSave(form: NgForm) {
    
    form.resetForm();
    
    
    this.editId = "";
    this.dateValue = "";
    
    
    this.resetFormState();
    
    
    this.router.navigate(['/tabs/expense'], { replaceUrl: true });
    
    console.log('Form reset after save, editId cleared');
  }

  
  onIonChange(event: any) {
    this.selectectedRange = event.detail.value;
    this.filters.amountMin = this.selectectedRange.lower;
    this.filters.amountMax = this.selectectedRange.upper;
    console.log("range amount : ", this.selectectedRange);
  }

  toggleFavorite(category: any) {
    category.isFavourite = !category.isFavourite;
    this.favCategories = this.allCategories.filter(cat => cat.isFavourite === true);
  }

  selectMultiple(name: string, filterKey: 'inflowOroutflow' | 'category' | 'note') {
    const targetSet = this.selectedSets[filterKey];

    if (targetSet.has(name)) {
      targetSet.delete(name);
    } else {
      targetSet.add(name);
    }

    this.filters[filterKey] = Array.from(targetSet);
  }

  filtersApplied() {
    this.isFilterApplied = true;
    this.filteredExpenseList = this.expenselist.filter(expense => {
      const amount = parseFloat(expense.amount);
      const expenseDate = new Date(expense.date);

      const amountMinOk = !this.filters.amountMin || amount >= this.filters.amountMin;
      const amountMaxOk = !this.filters.amountMax || amount <= this.filters.amountMax;
      const categoryOk = !this.filters.category || this.filters.category.length === 0 || this.filters.category.includes(expense.category);
      const dateFromOk = !this.filters.dateFrom || expenseDate >= new Date(this.filters.dateFrom);
      const dateToOk = !this.filters.dateTo || expenseDate <= new Date(this.filters.dateTo);
      const donorOk = !this.filters.inflowOroutflow || this.filters.inflowOroutflow.length === 0 || this.filters.inflowOroutflow.includes(expense.inflowOroutflow);

      return amountMinOk && amountMaxOk && categoryOk && dateFromOk && dateToOk && donorOk;
    });
    
    this.updateDisplayList();
    console.log("Applied filters", this.filters);
    console.log("Filtered List :", this.filteredExpenseList);
    this.router.navigate(['/tabs/expense']);
  }

  EditExpense(id: number, dateInEdit: string) {
    console.log('EditExpense called with ID:', id, 'Date:', dateInEdit);
    
    this.router.navigate(['/tabs/expense', { editValue: id, dateValue: dateInEdit }]);
  }

  Delete(id: number, deletesource: string) {
    console.log("Deleting expense ID:", id, "Source:", deletesource);
    
    const expenseList = this.storageservices.getData('expense') || [];
    const index = expenseList.findIndex((obj: { Id: number; }) => obj.Id == id);
    
    if (index !== -1) {
      expenseList.splice(index, 1);
      this.storageservices.setData('expense', expenseList);
      
      
      this.expenselist = expenseList;
      
      
      if (this.isFilterApplied) {
        const filteredIndex = this.filteredExpenseList.findIndex((obj) => obj.Id == id);
        if (filteredIndex !== -1) {
          this.filteredExpenseList.splice(filteredIndex, 1);
        }
      }
      
      
      this.updateDisplayList();
      
      console.log("Expense deleted successfully");
    }
  }

  onSearch(event: any) {
    const query = event.target.value?.toLowerCase().trim();
    const baseList = this.isFilterApplied ? this.filteredExpenseList : this.expenselist;

    this.displayList = !query
      ? [...baseList]
      : baseList.filter(item =>
          item.category?.toLowerCase().includes(query) ||
          item.note?.toLowerCase().includes(query) ||
          item.inflowOroutflow?.toLowerCase().includes(query)
        );
  }

  sort(order: string) {
    if (order == 'ascending') {
      console.log("OLDEST FIRST FUNCTION CALLED");
      if (this.isFilterApplied) {
        this.filteredExpenseList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        this.expenselist.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    } else if (order == 'descending') {
      console.log("RECENT FIRST FUNCTION CALLED");
      if (this.isFilterApplied) {
        this.filteredExpenseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        this.expenselist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }
    
    this.updateDisplayList();
  }

 
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  refreshPage() {
    window.location.reload();
  }

  saveFavorites() {
    this.storageservices.setData('favourites', this.favouritecategory);
  }

  alwaysAllowDrop() {
    return true;
  }

  drop(event: any) {
    console.log('DROP TRIGGERED', event);
  }
  async openModal() {
    if (this.modal) {
      await this.modal.present();
      this.isChevronUp = true;
    }
  }

  
}
