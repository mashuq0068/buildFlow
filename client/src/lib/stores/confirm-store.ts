import { create } from "zustand";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>()((set, get) => ({
  open: false,
  title: "",
  description: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  danger: false,
  resolve: null,

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false);
      set({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        danger: options.danger ?? false,
        resolve,
      });
    }),

  handleConfirm: () => {
    get().resolve?.(true);
    set({ open: false, resolve: null });
  },

  handleCancel: () => {
    get().resolve?.(false);
    set({ open: false, resolve: null });
  },
}));

export function confirmAction(options: ConfirmOptions) {
  return useConfirmStore.getState().confirm(options);
}
