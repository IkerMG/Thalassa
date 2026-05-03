import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  promise: <T>(
    promise: Promise<T>,
    opts: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, opts),
};
