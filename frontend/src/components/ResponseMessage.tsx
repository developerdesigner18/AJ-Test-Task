import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { StatusMessageEnum, type ApiResponse, type Credential } from "../types";

interface ResponseMessageProps {
    response: ApiResponse<Credential>;
}

export const ResponseMessage = ({ response }: ResponseMessageProps) => {
    const { status } = response;
    const getStatusConfig = () => {
        switch (status) {
            case StatusMessageEnum.Success:
                return {
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                    icon: CheckCircle,
                    iconColor: "text-green-600",
                    title: "Success!",
                    titleColor: "text-green-800",
                };
            case StatusMessageEnum.AlreadyIssued:
                return {
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    icon: AlertCircle,
                    iconColor: "text-yellow-600",
                    title: "Already Issued",
                    titleColor: "text-yellow-800",
                };
            case StatusMessageEnum.Error:
                return {
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                    icon: XCircle,
                    iconColor: "text-red-600",
                    title: "Error",
                    titleColor: "text-red-800",
                };
            default:
                return {
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                    icon: XCircle,
                    iconColor: "text-red-600",
                    title: "Error",
                    titleColor: "text-red-800",
                };
        }
    };

    const config = getStatusConfig();
    const IconComponent = config.icon;
    const { message, data: credential } = response;
    return (
        <div
            className={`mt-6 p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}
        >
            <div className="flex items-start">
                <IconComponent
                    className={`${config.iconColor} mr-3 flex-shrink-0`}
                    size={24}
                />
                <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${config.titleColor}`}>
                        {config.title}
                    </h3>

                    {message && (
                        <p className="text-sm text-gray-700 mb-3">{message}</p>
                    )}

                    {credential && (
                        <div className="bg-white p-3 rounded border mt-2 text-sm">
                            <p>
                                <strong>Credential ID:</strong>{" "}
                                {credential.credentialId}
                            </p>
                            <p>
                                <strong>Holder:</strong> {credential.holderName}
                            </p>
                            <p>
                                <strong>Email:</strong> {credential.holderEmail}
                            </p>
                            <p>
                                <strong>Type:</strong>{" "}
                                {credential.credentialType}
                            </p>
                            <p>
                                <strong>Worker Id:</strong>{" "}
                                {credential.workerId}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
