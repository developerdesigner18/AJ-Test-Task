import React, { useState, type FormEvent } from "react";
import { FormInput } from "./ui/FormInput";
import { SubmitButton } from "./ui/SubmitButton";
import { ResponseMessage } from "./ResponseMessage";
import { StatusMessageEnum, type ApiResponse, type Credential } from "../types";

interface VerifyFormData {
    credentialId: string;
}

type VerifyResponse = ApiResponse<Credential>;

const VerifyCredential: React.FC = () => {
    const [formData, setFormData] = useState<VerifyFormData>({
        credentialId: "",
    });

    const [response, setResponse] = useState<VerifyResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        try {
            const payload = {
                credentialId: formData.credentialId,
            };

            const res = await fetch(
                `${
                    import.meta.env.VITE_API_BASE_URL
                }/verification/credentials/verify/` + payload.credentialId,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: VerifyResponse = await res.json();
            setResponse(data);
        } catch (error) {
            setResponse({
                status: StatusMessageEnum.Error,
                message:
                    "Failed to connect to server: " +
                    (error instanceof Error ? error.message : "Unknown error"),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div aria-label="verify-tab-content">
            <div className="space-y-4">
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Credential ID"
                        name="credentialId"
                        value={formData.credentialId}
                        onChange={handleChange}
                        placeholder="e.g., CERT-2024-001"
                        required
                        className="focus:ring-green-500 focus:border-transparent"
                    />

                    <SubmitButton
                        loading={loading}
                        disabled={loading || !formData.credentialId}
                        loadingText="Verifying..."
                        defaultText="Verify Credential"
                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500 mt-4"
                    />
                </form>
            </div>

            {response && <ResponseMessage response={response} />}
        </div>
    );
};

export default VerifyCredential;
