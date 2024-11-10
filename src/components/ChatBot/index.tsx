// src/app/components/TranslationForm.tsx

'use client';

import { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaRegCopy } from 'react-icons/fa'; // Copy icon
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Loading spinner icon
import { languages } from '../language'; // Import languages
import { LanguageOption, TranslationSuccessResponse, TranslationErrorResponse, TranslationInternalErrorResponse } from '../../types/translate'; // Import types
import DarkModeToggle from '../DarkMode/index'; // Import DarkModeToggle

const customSelectStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: '#f3f4f6', // Tailwind gray-100
        borderColor: state.isFocused ? '#4f46e5' : '#d1d5db', // indigo-600 or gray-300
        boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#4f46e5' : '#9ca3af', // indigo-600 or gray-400
        },
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#1f2937', // Tailwind gray-800
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: '#ffffff', // white
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#4f46e5' // indigo-600
            : state.isFocused
                ? '#e0e7ff' // indigo-100
                : '#ffffff', // white
        color: state.isSelected ? '#ffffff' : '#1f2937', // white or gray-800
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#4f46e5', // indigo-600
            color: '#ffffff', // white
        },
    }),
};

const TranslationForm: React.FC = () => {
    // State variables
    const [inputLanguage, setInputLanguage] = useState<LanguageOption | null>({
        value: 'en',
        label: 'English',
    });
    const [outputLanguage, setOutputLanguage] = useState<LanguageOption | null>({
        value: 'ur',
        label: 'Urdu',
    });
    const [inputText, setInputText] = useState<string>('');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');


    // Handler for form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTranslatedText('');

        try {
            // Prepare JSON payload
            const payload = {
                input_language: inputLanguage?.value || '',
                output_language: outputLanguage?.value || '',
                input: inputText,
            };

            // Send POST request to the API
            const response = await axios.post<
                TranslationSuccessResponse | TranslationErrorResponse | TranslationInternalErrorResponse
            >('/api/translate', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Handle response
            if (response.status === 200 && 'translation' in response.data) {
                setTranslatedText(response.data.translation);

                // Update history with timestamp
                const newTranslation: TranslationSuccessResponse = {
                    translation: response.data.translation,
                    timestamp: new Date().toISOString(),
                };
                const updatedHistory = [newTranslation];

                // Store in localStorage
                localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
            } else if ('error' in response.data) {
                setError(response.data.error);
            } else if ('message' in response.data) {
                setError(response.data.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } catch (err: any) {
            console.error('Translation error:', err);
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Handler to copy translated text to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText);
        alert('Translated text copied to clipboard!');
    };


    return (
        <div className="max-w-5xl w-full mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg relative">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            <h2 className="text-4xl font-bold mb-8 text-center text-indigo-600 dark:text-indigo-400">AI Translator</h2>
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
                {/* Left Section: Input */}
                <div className="flex-1 flex flex-col space-y-6">
                    {/* Input Language */}
                    <div>
                        <label htmlFor="inputLanguage" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Input Language
                        </label>
                        <Select
                            id="inputLanguage"
                            value={inputLanguage}
                            onChange={(selectedOption) => setInputLanguage(selectedOption)}
                            options={languages}
                            styles={customSelectStyles}
                            placeholder="Select input language..."
                            isSearchable
                            required
                        />
                    </div>

                    {/* Input Text */}
                    <div>
                        <label htmlFor="inputText" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Text to Translate
                        </label>
                        <textarea
                            id="inputText"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                            rows={8}
                            placeholder="Enter the text you want to translate..."
                            required
                        ></textarea>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-1">
                            {inputText.length} / 1000 characters
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className={`w-full p-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center ${loading ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin h-6 w-6 mr-3" />
                                    Translating...
                                </>
                            ) : (
                                'Translate'
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Section: Output */}
                <div className="flex-1 flex flex-col space-y-6">
                    {/* Output Language */}
                    <div>
                        <label htmlFor="outputLanguage" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Output Language
                        </label>
                        <Select
                            id="outputLanguage"
                            value={outputLanguage}
                            onChange={(selectedOption) => setOutputLanguage(selectedOption)}
                            options={languages}
                            styles={customSelectStyles}
                            placeholder="Select output language..."
                            isSearchable
                            required
                        />
                    </div>

                    {/* Translated Text */}
                    <div>
                        <label htmlFor="translatedText" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Translated Text
                        </label>
                        <div className="relative">
                            <textarea
                                id="translatedText"
                                value={translatedText}
                                readOnly
                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
                                rows={8}
                                placeholder="Your translated text will appear here..."
                            ></textarea>
                            {translatedText && (
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md flex items-center justify-center transition-colors duration-300"
                                    title="Copy to clipboard"
                                >
                                    <FaRegCopy className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}

        </div>
    );
}

export default TranslationForm;
