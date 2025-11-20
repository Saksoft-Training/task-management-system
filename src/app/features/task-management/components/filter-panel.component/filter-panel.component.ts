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

  /**
   * Controls whether the filter panel is opened or closed.
   */
  @Input() public open: boolean = false;

  /**
   * The list of available assignees coming from the parent.
   */
  @Input() public assignees: string[] = [];

  //#endregion

  //#region ------------------ Output Events ---------------

  /**
   * Emits when user clicks on the close button or backdrop.
   */
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emits the updated filter object whenever a filter value changes.
   */
  @Output() public filtersChanged: EventEmitter<any> = new EventEmitter<any>();

  //#endregion

  //#region ---------------- Internal Filter State ----------

  /**
   * Current active filters applied inside the panel.
   */
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

  /**
   * Predefined filter values for the UI.
   */
  public statusList: string[] = ['To Do', 'In Progress', 'Completed'];
  public priorityList: string[] = ['Low', 'Medium', 'High', 'Urgent'];

  //#endregion

  //#region --------------- Public Methods ----------------

  /**
   * Adds or removes a value from a checkbox filter list.
   * @param list The target array (status, priority, assignee)
   * @param value The value to toggle
   */
  public toggleCheck(list: string[], value: string): void {
    const index = list.indexOf(value);

    if (index !== -1) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }

    this.filtersChanged.emit(this.filters);
  }

  /**
   * Clears all values inside a specific filter section.
   * @param section The section to clear
   */
  public clearSection(section: 'status' | 'priority' | 'assignee'): void {
    this.filters[section] = [];
    this.filtersChanged.emit(this.filters);
  }

  /**
   * Clears all filters and closes the panel.
   */
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
