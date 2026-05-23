import { toast } from 'react-hot-toast';
import type { Result } from '@/domain/types';

interface NotifyOptions<T> {
    success?: string;
    onSuccess?: (data: T) => void;
    onError?: (message: string) => void;
}

export function notifyResult<T>(
    result: Result<T>,
    options?: NotifyOptions<T>
): result is { success: true; data: T } {
    if (result.success) {
        if (options?.success) {
            toast.success(options.success);
        }
        options?.onSuccess?.(result.data);
        return true;
    }

    const message = result.errors.map(e => e.message).join(', ');
    const errorTypes = result.errors.map(e => e.type);

    if (errorTypes.some(t => t === 'Info')) {
        toast(message, { icon: 'ℹ️' });
    } else if (errorTypes.some(t => t === 'Warning')) {
        toast(message, { icon: '⚠️' });
    } else {
        toast.error(message);
    }

    options?.onError?.(message);

    return false;
}
