import React from "react";

interface SubmitButtonProps {
    loading: boolean;
    disabled: boolean;
    loadingText: string;
    defaultText: string;
    className?: string;
    others?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    loading,
    disabled,
    loadingText,
    defaultText,
    className = "",
    ...others
}) => {
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
            {...others}
        >
            {loading ? loadingText : defaultText}
        </button>
    );
};
