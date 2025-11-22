import { ToastType } from '../components/Toast';

let toastIdCounter = 0;

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, type?: ToastType) {
    const id = `toast-${++toastIdCounter}`;
    this.toasts.push({ id, message, type });
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string) {
    return this.show(message, 'success');
  }

  error(message: string) {
    return this.show(message, 'error');
  }

  warning(message: string) {
    return this.show(message, 'warning');
  }

  info(message: string) {
    return this.show(message, 'info');
  }
}

export const toastManager = new ToastManager();

