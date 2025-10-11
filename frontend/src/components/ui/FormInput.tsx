import React from "react";

interface FormInputProps {
    label: string;
    name: string;
    type?: "text" | "email" | "date" | "password";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    className = "",
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && "*"}
            </label>
            <input
                type={type}
                data-testid={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            />
        </div>
    );
};
