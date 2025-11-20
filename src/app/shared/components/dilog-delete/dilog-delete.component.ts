import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dilog-delete-component',
  imports: [],
  templateUrl: './dilog-delete.component.html',
  styleUrl: './dilog-delete.component.scss',
})
export class DilogDeleteComponent {
  //#region Input Properties
  /**
   * @summary Header text of the confirmation dialog.
   * @type {string}
   */
  @Input() public title: string = 'Confirm Action';
  /**
   * @summary Main body message (supports multiline text).
   * @type {string}
   */
  @Input() public message: string = 'Are you sure you want to continue?';
  /**
   * @summary Text shown on the confirm button.
   * @type {string}
   */
  @Input() public confirmText: string = 'Confirm';
  /**
   * @summary Text shown on the cancel button.
   * @type {string}
   */
  @Input() public cancelText: string = 'Cancel';
  /**
   * @summary Type of dialog to adjust styling.
   * @type {'danger' | 'warning' | 'info'}
   */
  @Input() public type: 'danger' | 'warning' | 'info' = 'warning';
  //#endregion

  //#region Output Events
  /**
   * @summary Emits event when user confirms the action.
   * @returns void
   */
  @Output() public confirm = new EventEmitter<void>();
  /**
   * @summary Emits event when user cancels the dialog.
   * @returns void
   */
  @Output() public cancel = new EventEmitter<void>();
  //#endregion

  //#region Methods
  /**
   * @summary Handles confirm button click.
   * @returns void
   */
  public onConfirm(): void {
    this.confirm.emit();
  }
  /**
   * @summary Handles cancel button click.
   * @returns void
   */
  public onCancel(): void {
    this.cancel.emit();
  }
  //#endregion

}
