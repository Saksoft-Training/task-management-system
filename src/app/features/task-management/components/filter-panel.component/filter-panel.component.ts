import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @summary
 * Slide-in filter panel component for task filtering.
 * Allows filtering by status, priority, assignee, and date range.
 * Emits updated filter values on every user action.
 */
@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
})
export class FilterPanelComponent {

  //#region -------------- Input Properties --------------

  /** Controls visibility of the filter sidebar */
  @Input() public open: boolean = false;

  /** List of users (assignees) from parent */
  @Input() public assignees: string[] = [];

  //#endregion

  //#region ------------------ Output Events ---------------

  /** Emits when filter panel is closed */
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

  /** Emits whenever filters change */
  @Output() public filtersChanged: EventEmitter<any> = new EventEmitter<any>();

  //#endregion

  //#region ---------------- Internal Filter State ----------

  /** Stores all applied filter values */
  public filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    fromDate: string | null;
    toDate: string | null;
  } = {
    status: [],
    priority: [],
    assignee: [],
    fromDate: null,
    toDate: null,
  };

  /** UI lists */
  public statusList: string[] = ['To Do', 'In Progress', 'Completed'];
  public priorityList: string[] = ['Low', 'Medium', 'High', 'Urgent'];

  //#endregion

  //#region --------------- Public Methods ----------------

  /** Toggles checkbox selection */
  public toggleCheck(list: string[], value: string): void {
    const index = list.indexOf(value);

    if (index !== -1) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }

    this.filtersChanged.emit(this.filters);
  }

  /** Clear only 1 filter section */
  public clearSection(section: 'status' | 'priority' | 'assignee'): void {
    this.filters[section] = [];
    this.filtersChanged.emit(this.filters);
  }

  /** Clear all filters */
  public clearAll(): void {
    this.filters = {
      status: [],
      priority: [],
      assignee: [],
      fromDate: null,
      toDate: null,
    };

    this.filtersChanged.emit(this.filters);
    this.close.emit();
  }

  //#endregion
}