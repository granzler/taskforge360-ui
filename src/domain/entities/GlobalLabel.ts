export interface GlobalLabelDto {
    id: number;
    tagName: string;
    description: string;
}

export interface CreateLabelRequestDto {
    tagName: string;
    description: string;
}

export interface UpdateLabelRequestDto {
    tagName: string;
    description: string;
}