// src/app/types/types.ts

export interface TranslationSuccessResponse {
    translation: string;
}

export interface TranslationErrorResponse {
    error: string;
}

export interface TranslationInternalErrorResponse {
    message: string;
}

export interface LanguageOption {
    value: string;
    label: string;
}
