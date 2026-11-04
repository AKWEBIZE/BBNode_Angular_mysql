import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
  standalone: false
})
export class SearchableDropdownComponent implements OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select...';
  @Input() searchPlaceholder: string = 'Type to search...';
  @Input() options: any[] = []; // array of objects or strings
  @Input() value: any = null; // selected option
  @Input() displayKey: string = 'name'; // if options are objects, which property to display
  @Input() valueKey: string = 'code';   // if options are objects, which property is the value
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() error: string | null = null;
  
  @Output() valueChange = new EventEmitter<any>();

  isOpen: boolean = false;
  searchQuery: string = '';
  filteredOptions: any[] = [];
  highlightedIndex: number = -1;

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] || changes['value']) {
      this.filterOptions();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
      this.filterOptions();
      setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
    } else {
      this.highlightedIndex = -1;
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.filterOptions();
    this.highlightedIndex = -1;
  }

  filterOptions() {
    if (!this.options) {
      this.filteredOptions = [];
      return;
    }
    
    if (!this.searchQuery) {
      this.filteredOptions = [...this.options];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredOptions = this.options.filter(option => {
      const label = this.getDisplayLabel(option).toLowerCase();
      return label.includes(query);
    });
  }

  selectOption(option: any) {
    this.value = option;
    this.valueChange.emit(option);
    this.closeDropdown();
  }

  getDisplayLabel(option: any): string {
    if (!option) return '';
    return typeof option === 'object' ? option[this.displayKey] : option.toString();
  }
  
  getValueLabel(): string {
    if (this.value === null || this.value === undefined || this.value === '') return '';
    if (typeof this.value === 'object') return this.value[this.displayKey] || '';
    
    // If value is a primitive code, find matching object
    if (this.options && this.options.length > 0 && typeof this.options[0] === 'object') {
      const found = this.options.find(opt => opt[this.valueKey] === this.value);
      return found ? found[this.displayKey] : this.value.toString();
    }
    
    return this.value.toString();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (!this.isOpen && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
      this.toggleDropdown();
      event.preventDefault();
      return;
    }

    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1);
        this.scrollIntoView();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        this.scrollIntoView();
        event.preventDefault();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        event.preventDefault();
        break;
      case 'Escape':
      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  private scrollIntoView() {
    setTimeout(() => {
      const activeEl = this.elementRef.nativeElement.querySelector('.option-item.highlighted');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }, 0);
  }

  getHighlightedText(text: string): string {
    if (!this.searchQuery) return text;
    const idx = text.toLowerCase().indexOf(this.searchQuery.toLowerCase());
    if (idx < 0) return text;
    
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + this.searchQuery.length);
    const after = text.substring(idx + this.searchQuery.length);
    
    return `${before}<b>${match}</b>${after}`;
  }
}
