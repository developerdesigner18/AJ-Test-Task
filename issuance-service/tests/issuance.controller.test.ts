import { Request, Response } from "express";
import { IssuanceController } from "../src/controllers/Issuance.controller";
import { IIssuanceService} from "../src/services/Issuance.service";
import { AppResponse, StatusMessageEnum } from "../src/extensions/Response";
import {
    jest,
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
} from "@jest/globals";

describe("IssuanceController", () => {
    let controller: IssuanceController;
    let mockIssuanceService: jest.Mocked<IIssuanceService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        // Create mock service
        mockIssuanceService = {
            issueCredential: jest.fn(),
        };

        // Create mock response
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        // @ts-ignore
        mockResponse = {
        // @ts-ignore
            status: statusMock,
        // @ts-ignore
            json: jsonMock,
        };

        // Create mock request
        mockRequest = {
            body: {},
        };

        // Create controller instance
        controller = new IssuanceController(mockIssuanceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("issueCredential", () => {
        it("should return 201 and success response when credential is issued successfully", async () => {
            const credentialData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const successResult = AppResponse.success(credentialData);
            mockRequest.body = credentialData;
            mockIssuanceService.issueCredential.mockResolvedValue(successResult);

            await controller.issueCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).toHaveBeenCalledWith(
                credentialData
            );
            expect(mockIssuanceService.issueCredential).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(successResult);
        });

        it("should return 409 when credential already exists", async () => {
            const credentialData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const alreadyIssuedResult = AppResponse.alreadyIssued(credentialData);
            mockRequest.body = credentialData;
            mockIssuanceService.issueCredential.mockResolvedValue(
                alreadyIssuedResult
            );

            await controller.issueCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).toHaveBeenCalledWith(
                credentialData
            );
            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith(alreadyIssuedResult);
        });

        it("should return 409 when service returns error status", async () => {
            const credentialData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const errorResult = AppResponse.error("missing required fields");
            mockRequest.body = credentialData;
            mockIssuanceService.issueCredential.mockResolvedValue(errorResult);

            await controller.issueCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).toHaveBeenCalledWith(
                credentialData
            );
            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith(errorResult);
        });

        it("should return 400 when an exception is thrown", async () => {
            const credentialData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            mockRequest.body = credentialData;
            mockIssuanceService.issueCredential.mockRejectedValue(
                new Error("Database connection failed")
            );

            await controller.issueCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).toHaveBeenCalledWith(
                credentialData
            );
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                AppResponse.error("Error issuing credential")
            );
        });

        it("should handle empty request body", async () => {
            mockRequest.body = {};
            const errorResult = AppResponse.error("missing required fields");
            mockIssuanceService.issueCredential.mockResolvedValue(errorResult);

            await controller.issueCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).toHaveBeenCalledWith({});
            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith(errorResult);
        });
    });

    describe("healthCheck", () => {
        it("should return 200 with service health information", async () => {
            const mockDate = new Date("2024-01-15T10:30:00.000Z");
            jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

            await controller.healthCheck(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                AppResponse.success({
                    service: "issuance-service",
                    timestamp: "2024-01-15T10:30:00.000Z",
                })
            );

            jest.restoreAllMocks();
        });

        it("should not call issuance service", async () => {
            await controller.healthCheck(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockIssuanceService.issueCredential).not.toHaveBeenCalled();
        });

        it("should return correct response structure", async () => {
            await controller.healthCheck(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledTimes(1);
            
            const responseCall = jsonMock.mock.calls[0][0];
            expect(responseCall).toHaveProperty("status", StatusMessageEnum.Success);
            expect(responseCall).toHaveProperty("data");
        // @ts-ignore
            expect(responseCall.data).toHaveProperty("service", "issuance-service");
        // @ts-ignore
            expect(responseCall.data).toHaveProperty("timestamp");
        });
    });
});