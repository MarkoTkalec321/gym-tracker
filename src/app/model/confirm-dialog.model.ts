export interface ConfirmDialogData {
  title: string;
  message: string;
  options: ('Register' | 'Login' | 'Cancel')[];
}

export interface ConfirmDialogDataDeleteClient {
  title: string;
  message: string;
}
