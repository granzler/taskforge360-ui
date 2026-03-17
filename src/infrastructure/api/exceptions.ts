import { ApiErrorResponse } from '@/domain/types';

export class ApiException extends Error {
    public readonly response: ApiErrorResponse;

    constructor(response: ApiErrorResponse) {
        super(response.errors.map(e => e.message).join(', ') || 'API Error');
        this.name = 'ApiException';
        this.response = response;
    }
}
