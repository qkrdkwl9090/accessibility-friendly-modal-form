
export interface FormData {
  name: string;
  email: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export type ModalResult = FormData | null;

export interface ModalState {
  isOpen: boolean;
  resolve?: (result: ModalResult) => void;
}