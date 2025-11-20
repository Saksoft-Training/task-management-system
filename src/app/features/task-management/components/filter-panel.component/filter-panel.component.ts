import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent {

  @Input() open = false;
  @Input() assignees: string[] = [];   // ✅ use real users from parent

  @Output() close = new EventEmitter<void>();
  @Output() filtersChanged = new EventEmitter<any>();

  // --------------------------
  //  FILTER STATE
  // --------------------------
  filters = {
    status: [] as string[],
    priority: [] as string[],
    assignee: [] as string[],
    fromDate: null as string | null,
    toDate: null as string | null,
  };

  statusList = ["To Do", "In Progress", "Completed"];
  priorityList = ["Low", "Medium", "High", "Urgent"];

  toggleCheck(list: string[], value: string) {
    if (list.includes(value)) {
      list.splice(list.indexOf(value), 1);
    } else {
      list.push(value);
    }
    this.filtersChanged.emit(this.filters);
  }

  clearSection(section: 'status' | 'priority' | 'assignee') {
    this.filters[section] = [];
    this.filtersChanged.emit(this.filters);
  }

  clearAll() {
    this.filters = {
      status: [],
      priority: [],
      assignee: [],
      fromDate: null,
      toDate: null,
    };

    this.filtersChanged.emit(this.filters);

    this.close.emit(); // closes filter panel
  }
}
