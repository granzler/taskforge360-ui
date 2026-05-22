export interface GlobalLabelDto {
    id: number;
    tagName: string;
    description: string;
    concurrencyVersion: number;
}

export interface CreateLabelRequestDto {
    tagName: string;
    description: string;
}

export interface UpdateLabelRequestDto {
    tagName: string;
    description: string;
    concurrencyVersion: number;
}