import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @summary
 * A reusable confirmation modal component used for delete actions.
 * Displays a message and provides Confirm/Cancel event outputs.
 */
@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrls: ['./delete-confirm-modal.component.scss'],
})
export class DeleteConfirmModalComponent {

  //#region ---------- Input Properties -----------

  /**
   * Controls the visibility of the modal.
   * @default false
   */
  @Input() public visible: boolean = false;

  /**
   * Name of the item being deleted, displayed in the modal message.
   */
  @Input() public itemName: string | undefined;

  //#endregion

  //#region -------------- Output Events ----------

  /**
   * Emits when user confirms the delete action.
   */
  @Output() public confirm: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emits when user cancels the delete action.
   */
  @Output() public cancel: EventEmitter<void> = new EventEmitter<void>();

  //#endregion

  //#region ---------- Public Methods (Event Emitters) -----------

  /**
   * Triggered when the user clicks on the "Confirm" button.
   * Emits the confirm event.
   */
  public onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Triggered when the user clicks on the "Cancel" button or closes the modal.
   * Emits the cancel event.
   */
  public onCancel(): void {
    this.cancel.emit();
  }

  //#endregion
}

