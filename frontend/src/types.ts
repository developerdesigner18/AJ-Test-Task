export enum StatusMessageEnum {
    Success = "success",
    Error = "error",
    AlreadyIssued = "already_issued",
}
export interface Credential {
    credentialId: string;
    holderName: string;
    holderEmail: string;
    credentialType: string;
    workerId: string;
}

export type ApiResponse<T> = {
    status: StatusMessageEnum | "already_issued";
    message?: string;
    data?: T;
};
