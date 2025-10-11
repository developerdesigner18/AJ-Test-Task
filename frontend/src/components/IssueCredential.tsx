import React, { useState, type FormEvent } from "react";
import { FormInput } from "./ui/FormInput";
import { SubmitButton } from "./ui/SubmitButton";
import { ResponseMessage } from "./ResponseMessage";
import { StatusMessageEnum, type ApiResponse, type Credential } from "../types";

interface IssueFormData {
    credentialId: string;
    holderName: string;
    holderEmail: string;
    credentialType: string;
    issuedFor: string;
}
type IssueResponse = ApiResponse<Credential>;
const IssueCredential: React.FC = () => {
    const [formData, setFormData] = useState<IssueFormData>({
        credentialId: "",
        holderName: "",
        holderEmail: "",
        credentialType: "",
        issuedFor: "",
    });

    const [response, setResponse] = useState<IssueResponse | null>(null);
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
                holderName: formData.holderName,
                holderEmail: formData.holderEmail,
                credentialType: formData.credentialType,
            };

            const res = await fetch(
                `${
                    import.meta.env.VITE_API_BASE_URL
                }/issuance/credentials/issue`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data: IssueResponse = await res.json();
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

    const isFormValid =
        formData.credentialId &&
        formData.holderName &&
        formData.holderEmail &&
        formData.credentialType;

    return (
        <div aria-label="issue-tab-content">
            <div className="space-y-4">
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Credential ID"
                        name="credentialId"
                        value={formData.credentialId}
                        onChange={handleChange}
                        placeholder="e.g., CERT-2024-001"
                        required
                    />

                    <FormInput
                        label="Holder Name"
                        name="holderName"
                        value={formData.holderName}
                        onChange={handleChange}
                        placeholder="e.g., John Doe"
                        required
                    />

                    <FormInput
                        label="Holder Email"
                        name="holderEmail"
                        type="email"
                        value={formData.holderEmail}
                        onChange={handleChange}
                        placeholder="e.g., john@example.com"
                        required
                    />

                    <FormInput
                        label="Credential Type"
                        name="credentialType"
                        value={formData.credentialType}
                        onChange={handleChange}
                        placeholder="e.g., Degree Certificate"
                        required
                    />

                    <SubmitButton
                        loading={loading}
                        disabled={!isFormValid || loading}
                        loadingText="Issuing..."
                        defaultText="Issue Credential"
                        className="mt-4"
                    />
                </form>
            </div>

            {response && <ResponseMessage response={response} />}
        </div>
    );
};

export default IssueCredential;
