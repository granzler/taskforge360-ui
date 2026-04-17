import { describe, it, expect, vi, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from '@/infrastructure/api/axios';
import { globalLabelService } from '@/infrastructure/services/globalLabelService';
import { GlobalLabelDto } from '@/domain/entities/GlobalLabel';

const mock = new MockAdapter(axios);

describe('globalLabelService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mock.reset();
    });

    describe('getAll', () => {
        it('should return all labels', async () => {
            const mockLabels: GlobalLabelDto[] = [
                { id: 1, tagName: 'Bug', description: 'Bug label' },
                { id: 2, tagName: 'Feature', description: 'Feature label' },
            ];

            mock.onGet('/api/Labels').reply(200, mockLabels);

            const result = await globalLabelService.getAll();

            expect(result.success).toBe(true);
            expect((result as { success: true; data: GlobalLabelDto[] }).data).toEqual(mockLabels);
        });

        it('should handle error on getAll failure', async () => {
            mock.onGet('/api/Labels').reply(500, { errors: [{ code: 'ERROR', message: 'Server error', type: 'System' }] });

            const result = await globalLabelService.getAll();

            expect(result.success).toBe(false);
            expect((result as { success: false; errors: unknown[] }).errors).toBeDefined();
        });
    });

    describe('getById', () => {
        it('should return label by id', async () => {
            const mockLabel: GlobalLabelDto = { id: 1, tagName: 'Bug', description: 'Bug label' };

            mock.onGet('/api/Labels/1').reply(200, mockLabel);

            const result = await globalLabelService.getById(1);

            expect(result.success).toBe(true);
            expect((result as { success: true; data: GlobalLabelDto }).data).toEqual(mockLabel);
        });

        it('should handle error on getById failure', async () => {
            mock.onGet('/api/Labels/999').reply(404, { errors: [{ code: 'NOT_FOUND', message: 'Label not found', type: 'Validation' }] });

            const result = await globalLabelService.getById(999);

            expect(result.success).toBe(false);
        });
    });

    describe('create', () => {
        it('should create a new label', async () => {
            const newLabel: GlobalLabelDto = { id: 3, tagName: 'Improvement', description: 'Improvement label' };

            mock.onPost('/api/Labels').reply(201, newLabel);

            const result = await globalLabelService.create({
                tagName: 'Improvement',
                description: 'Improvement label',
            });

            expect(result.success).toBe(true);
            expect((result as { success: true; data: GlobalLabelDto }).data).toEqual(newLabel);
        });

        it('should handle validation error on create', async () => {
            mock.onPost('/api/Labels').reply(400, { errors: [{ code: 'VALIDATION_ERROR', message: 'TagName required', type: 'Validation' }] });

            const result = await globalLabelService.create({
                tagName: '',
                description: '',
            });

            expect(result.success).toBe(false);
        });
    });

    describe('update', () => {
        it('should update an existing label', async () => {
            const updatedLabel: GlobalLabelDto = { id: 1, tagName: 'Bug', description: 'Updated bug description' };

            mock.onPut('/api/Labels/1').reply(200, updatedLabel);

            const result = await globalLabelService.update(1, {
                tagName: 'Bug',
                description: 'Updated bug description',
            });

            expect(result.success).toBe(true);
            expect((result as { success: true; data: GlobalLabelDto }).data).toEqual(updatedLabel);
        });

        it('should handle error on update failure', async () => {
            mock.onPut('/api/Labels/999').reply(404, { errors: [{ code: 'NOT_FOUND', message: 'Label not found', type: 'Validation' }] });

            const result = await globalLabelService.update(999, {
                tagName: 'Test',
                description: 'Test',
            });

            expect(result.success).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete a label', async () => {
            mock.onDelete('/api/Labels/1').reply(204);

            const result = await globalLabelService.delete(1);

            expect(result.success).toBe(true);
        });

        it('should handle error on delete failure', async () => {
            mock.onDelete('/api/Labels/999').reply(404, { errors: [{ code: 'NOT_FOUND', message: 'Label not found', type: 'Validation' }] });

            const result = await globalLabelService.delete(999);

            expect(result.success).toBe(false);
        });
    });
});