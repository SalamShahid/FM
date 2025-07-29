import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Categories } from '../Interfaces/categories';
import { DateshareService } from '../Services/dateshare.service';
import { StorageService } from '../Services/storage.service';
import { AnimationController, IonModal, ModalController, RangeCustomEvent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { FormInterface } from '../Interfaces/formInterface';
import { FilterInterface } from '../Interfaces/filterInterface';

@Component({
  selector: 'app-income',
  templateUrl: './income.page.html',
  styleUrls: ['./income.page.scss'],
  standalone: false
})
export class IncomePage implements OnInit {
  trackById(index: number, item: any): number {
    return item.Id;
  }
  
  displayList: FormInterface[] = [];
  editId: any = '';
  dateValue: any;
  
  @ViewChild('form') form!: NgForm;
  @ViewChild(IonModal) modal!: IonModal;
  
  constructor(
    private modalController: ModalController,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private animationCtrl: AnimationController,
    private cdr: ChangeDetectorRef  // Add ChangeDetectorRef
  ) { }
  
  favCategories: Categories[] = [];
  Dateshared: DateshareService = inject(DateshareService);
  activeView: string = 'amount';
  formSubmitted: boolean = false;
  donorflag: boolean = false;
  noteflag: boolean = false;
  categoryflag: boolean = false;
  Dateflag: boolean = false;
  range: boolean = false;
  amountFilter: boolean = false;
  storageservices: StorageService = inject(StorageService);
  isCategoryFavourite = false;
  isChevronUp = false;
  categorycard: boolean = false;
  selectedCategory: string = "";
  selectedIcon: string = "grid-outline";
  isCalendarHidden: boolean = false;
  isFilterApplied: boolean = false;
  selectedDate: string = new Date().toISOString().split('T')[0];
  entry = true;
  view = false;
  isFiltered: boolean = false;
  selectedSegment = 'all';
  selectectedRange: { lower: number; upper: number } = { lower: 0, upper: 0 };
  selectedButton: string | null = null;
  selectedButtons: Set<string> = new Set();
  selectedSets: { [key: string]: Set<string> } = {
    inflowOroutflow: new Set(),
    category: new Set(),
    note: new Set()
  };
  sortedList: FormInterface[] = [];

  incomelist: FormInterface[] = [];
  cardList: string[] = [
    "Amount",
    "Received from",
    "Category",
    "Date",
    "Note"
  ];
  
  incomeForm: FormInterface = {
    Id: 1,
    amount: "0",
    inflowOroutflow: "",
    category: "",
    iconName: "",
    date: "",
    note: ""
  };
  
  filteredCategories: Categories[] = [];
  Income: FormInterface[] = [];
  favouritecategory: Categories[] = [];
  maxFavourites = 6;
  selectedItem: string = '';
  filteredIncomeList: FormInterface[] = [];
  allCategories: Categories[] = [];
  
  filters: FilterInterface = {
    amountMin: 0,
    amountMax: 0,
    category: [],
    inflowOroutflow: [],
    dateFrom: "",
    dateTo: "",
    note: []
  }
 
  slideInAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, transform: 'translateX(100%)' },
        { offset: 1, transform: 'translateX(0)' }
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  slideOutAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', 'var(--backdrop-opacity)', '0.01');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, transform: 'translateX(0)' },
        { offset: 1, transform: 'translateX(100%)' }
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };


  ionViewWillEnter() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.incomeForm.date = this.selectedDate;
    

    if (!this.editId) {
      this.resetForm();
    }
    

    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.initializeCategories();
    this.loadIncomeData();
    this.handleEditMode();
    this.setupDataSubscription();
    this.setupFavoriteCategories();
  }

  private initializeCategories() {
    const index = this.categories.findIndex(item => item.name === 'Add Category');
    if (index !== -1) {
      this.filteredCategories = this.categories.splice(index, 1);
    }
  }

  private loadIncomeData() {
    this.incomelist = this.storageservices.getData('income') ?? [];
    this.displayList = [...this.incomelist]; // Create a copy to avoid reference issues
    console.log('the getted income list is', this.incomelist);
  }

  private handleEditMode() {
    this.editId = this.activatedroute.snapshot.paramMap.get('editValue') ?? "";
    this.dateValue = this.activatedroute.snapshot.paramMap.get('dateValue') ?? "";
    
    console.log('Edit ID:', this.editId);
    console.log('Date Value:', this.dateValue);
    
    if (this.editId) {
      this.Income = this.storageservices.getData('income') ?? [];
      const editItem = this.Income.find((obj) => obj.Id == parseInt(this.editId));
      
      if (editItem) {
        this.incomeForm = { ...editItem }; // Create a copy
        this.selectedCategory = editItem.category;
        this.selectedIcon = editItem.iconName || "grid-outline";
        
        if (this.dateValue) {
          this.selectedDate = this.dateValue;
          this.incomeForm.date = this.dateValue;
        }
      }
    } else {
      this.resetForm();
    }
  }

  private resetForm() {
    this.incomeForm = {
      Id: 1,
      amount: "",
      inflowOroutflow: "",
      category: "",
      iconName: "",
      date: this.selectedDate,
      note: ""
    };
    this.selectedCategory = "";
    this.selectedIcon = "grid-outline";
  }

  private setupDataSubscription() {
    this.storageservices.data$.subscribe(data => {
      if (data?.key === 'income' && Array.isArray(data.value)) {
        this.incomelist = [...data.value]; // Create new array reference
        this.displayList = this.isFilterApplied ? this.filteredIncomeList : [...this.incomelist];
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  private setupFavoriteCategories() {
    this.favCategories = this.categories.filter(cat => cat.isFavourite === true);
    console.log(this.favCategories);
    
    const all = this.storageservices.getData('incomecategories');
    const favs = this.storageservices.getData('favourites');
    
    if (!all || all.length === 0) {
      const defaultCategories: Categories[] = [
        { id: 1, name: 'Add category', icon: 'create-outline', value: 'new', isFavourite: false },
        { id: 2, name: 'Business', icon: 'briefcase-outline', value: 'work', isFavourite: false },
        { id: 3, name: 'Rental', icon: 'business-outline', value: 'rent', isFavourite: false },
        { id: 4, name: 'Interest', icon: 'cash', value: 'interest', isFavourite: false },
        { id: 5, name: 'Investment', icon: 'trending-up-outline', value: 'investment', isFavourite: false },
        { id: 6, name: 'Salary', icon: 'cash-outline', value: 'salary', isFavourite: false }
      ];
      this.storageservices.setData('incomecategories', defaultCategories);
      this.allCategories = defaultCategories;
    } else {
      this.allCategories = all;
    }
    this.favouritecategory = favs || [];
  }

  alwaysAllowDrop() {
    return true;
  }

  selectCategory(category: string, icon: string){

    if (icon == "create-outline") {this.modalController.dismiss({
        dismissed: true
      });
      console.log('Navigation started');
      this.router.navigate(['/category-create'], {
        queryParams: { createCategorySource: 'income' }
      }).then(success => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.log('Navigation failed');
        }
      }).catch(err => {
        console.error('Navigation error:', err);
      });
      return;
    }
    
    this.selectedCategory = category ?? "";
    this.selectedIcon = icon;
    this.incomeForm.category = category;
    this.incomeForm.iconName = icon;
    
    // Close modal after selection
    if (this.modal) {
      this.modal.dismiss();
    }
  }

  selecticon(icon: any) {
    this.selectedIcon = icon;
  }

  categories: Categories[] = [
    { id: 1, name: 'Salary', icon: 'cash-outline', value: 'salary', isFavourite: false },
    { id: 2, name: 'Business', icon: 'briefcase-outline', value: 'work', isFavourite: false },
    { id: 3, name: 'Rental', icon: 'business-outline', value: 'rent', isFavourite: false },
    { id: 4, name: 'Interest', icon: 'cash', value: 'interest', isFavourite: false },
    { id: 5, name: 'Investment', icon: 'trending-up-outline', value: 'investment', isFavourite: false },
    { id: 6, name: 'Add category', icon: 'create-outline', value: 'new', isFavourite: false }
  ];

  onCategorySelect(event: any) {
    console.log('Selected category:', event.detail.value);
  }

  inputclick() {
    this.categorycard = true;
    
  }

  toggleCalendar() {
    this.isCalendarHidden = !this.isCalendarHidden;
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  onDateChange(value: any) {
    if (value) {
      this.selectedDate = value;
      this.incomeForm.date = value;
      console.log("Date selected:", value);
      this.cdr.detectChanges();
    }
  }

  Save(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

 
    this.Income = this.storageservices.getData('income') ?? [];

    if (this.editId === "" || !this.editId) {
      // Generate new ID
      const newId = this.Income.length > 0 ? Math.max(...this.Income.map(item => item.Id)) + 1 : 1;
      const newItem = { ...this.incomeForm, Id: newId };
      this.Income.push(newItem);
    } else {
      const index = this.Income.findIndex(obj => obj.Id === parseInt(this.editId ?? ""));
      if (index !== -1) {
        this.Income.splice(index, 1, { ...this.incomeForm });
      }
    }

    // Save to storage
    this.storageservices.setData('income', this.Income);
    
    // Update local lists
    this.incomelist = [...this.Income];
    this.displayList = this.isFilterApplied ? this.filteredIncomeList : [...this.incomelist];

    // Reset form and state
    this.resetFormAfterSave(form);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  private resetFormAfterSave(form: NgForm) {
     this.formSubmitted = true;
    // Reset edit state
    this.editId = '';
    
    // Reset form with current date
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.resetForm();
    
    // Reset Angular form
    form.resetForm({
      date: this.selectedDate
    });
    
    // Clear URL parameters
    this.router.navigate(['/tabs/income'], { replaceUrl: true });
  }

  saveFavorites() {
    this.storageservices.setData('favourites', this.favouritecategory);
  }

  toggleFavorite(category: any) {
    category.isFavourite = !category.isFavourite;
    this.favCategories = this.categories.filter(cat => cat.isFavourite === true);
  }

  Entry() {
    this.entry = true;
  }

  View() {
    this.view = true;
  }

  async openModal(item: string) {
    this.selectedItem = item;
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

  priceRange = { lower: 0, upper: 100000 };

  selectedview(view: string) {
    if (this.activeView !== view) {
      this.activeView = view;
    }
  }

  onIonChange(event: any) {
    this.selectectedRange = event.detail.value;
    this.filters.amountMin = this.selectectedRange.lower;
    this.filters.amountMax = this.selectectedRange.upper;
    console.log("range amount : ", this.selectectedRange);
  }

  selectMultiple(name: string, filterKey: 'inflowOroutflow' | 'category' | 'note') {
    const targetSet = this.selectedSets[filterKey];

    if (targetSet.has(name)) {
      targetSet.delete(name);
    } else {
      targetSet.add(name);
    }

    this.filters[filterKey] = Array.from(targetSet);
    
    
    if (this.selectedButtons.has(name)) {
      this.selectedButtons.delete(name);
    } else {
      this.selectedButtons.add(name);
    }
  }

  filtersApplied() {
    this.isFilterApplied = true;
    console.log("filter apply flag in apply:", this.isFilterApplied);
    
    this.filteredIncomeList = this.incomelist.filter(income => {
      const amount = parseFloat(income.amount);
      const incomeDate = new Date(income.date);

      const amountMinOk = !this.filters.amountMin || amount >= this.filters.amountMin;
      const amountMaxOk = !this.filters.amountMax || amount <= this.filters.amountMax;
      const categoryOk = !this.filters.category || this.filters.category.length === 0 || this.filters.category.includes(income.category);
      const dateFromOk = !this.filters.dateFrom || incomeDate >= new Date(this.filters.dateFrom);
      const dateToOk = !this.filters.dateTo || incomeDate <= new Date(this.filters.dateTo);
      const donorOk = !this.filters.inflowOroutflow || this.filters.inflowOroutflow.length === 0 ||
        this.filters.inflowOroutflow.includes(income.inflowOroutflow);

      return amountMinOk && amountMaxOk && categoryOk && dateFromOk && dateToOk && donorOk;
    });
    
    this.displayList = [...this.filteredIncomeList];
    console.log("Applied filters", this.filters);
    console.log("Filtered List :", this.filteredIncomeList);
    
    // Close modal
    if (this.modal) {
      this.modal.dismiss();
    }
    
    this.cdr.detectChanges();
  }

  sort(order: string) {
    let listToSort = this.isFilterApplied ? this.filteredIncomeList : this.incomelist;
    
    if (order === 'ascending') {
      console.log("OLDEST FIRST FUNCTION CALLED");
      listToSort.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (order === 'descending') {
      console.log("recent first function working");
      listToSort.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    this.displayList = [...listToSort];
    this.cdr.detectChanges();
  }

  
  EditIncome(id: number, dateInEdit: string) {
    // Clear any existing edit state first
    this.editId = '';
    this.cdr.detectChanges();
    
    // Navigate with parameters
    this.router.navigate(['/tabs/income', { editValue: id, dateValue: dateInEdit }])
      .then(() => {
        // Force component to re-initialize with new parameters
        this.handleEditMode();
        this.cdr.detectChanges();
      });
  }

  Delete(id: number, deletesource: string) {
    console.log("list before deletion", this.incomelist);
    
    if (deletesource === 'incomelist') {
      const index = this.incomelist.findIndex((obj) => obj.Id == id);
      if (index !== -1) {
        this.incomelist.splice(index, 1);
        this.storageservices.setData('income', this.incomelist);
        this.displayList = [...this.incomelist];
      }
    }
    
    if (deletesource === 'filter') {
      const filterIndex = this.filteredIncomeList.findIndex((obj) => obj.Id == id);
      const mainIndex = this.incomelist.findIndex((obj) => obj.Id == id);
      
      if (filterIndex !== -1) {
        this.filteredIncomeList.splice(filterIndex, 1);
      }
      if (mainIndex !== -1) {
        this.incomelist.splice(mainIndex, 1);
        this.storageservices.setData('income', this.incomelist);
      }
      
      this.displayList = [...this.filteredIncomeList];
    }
    
    console.log("list after deletion", this.incomelist);
    this.cdr.detectChanges();
  }

  onSearch(event: any) {
    const query = event.target.value?.toLowerCase().trim();
    const baseList = this.isFilterApplied ? this.filteredIncomeList : this.incomelist;

    this.displayList = !query
      ? [...baseList]
      : baseList.filter(item =>
          item.category?.toLowerCase().includes(query) ||
          item.note?.toLowerCase().includes(query) ||
          item.inflowOroutflow?.toLowerCase().includes(query) ||
          item.amount.includes(query)
        );
    
    this.cdr.detectChanges();
  }

  triggerChange() {
    this.cdr.detectChanges();
  }
  
}

