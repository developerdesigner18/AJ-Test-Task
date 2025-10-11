import { Response } from "express";
export enum StatusMessageEnum {
    Success = "success",
    Error = "error",
    AlreadyIssued = "already_issued",
}
export class AppResponse {
    static success(data: any) {
        return {
            status: StatusMessageEnum.Success,
            data,
        };
    }
    static error(message: string) {
        return {
            status: StatusMessageEnum.Error,
            message,
        };
    }
    static alreadyIssued(data:any){
        return {
            status: StatusMessageEnum.AlreadyIssued,
            data,
        };
    }
}
