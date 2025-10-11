import { Request, Response } from "express";
import { VerificationController } from "../src/controllers/Verification.controller";
import { IVerificationService } from "../src/services/Verification.service";
import { AppResponse, StatusMessageEnum } from "../src/extensions/Response";
import {
    jest,
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
} from "@jest/globals";

describe("VerificationController", () => {
    let controller: VerificationController;
    let mockVerificationService: jest.Mocked<IVerificationService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        // Create mock service
        mockVerificationService = {
            verifyCredential: jest.fn(),
        };

        // Create mock response
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockResponse = {
            // @ts-ignore
            status: statusMock,
            // @ts-ignore
            json: jsonMock,
        };

        // Create mock request
        mockRequest = {
            params: {},
        };

        // Create controller instance
        controller = new VerificationController(mockVerificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("verifyCredential", () => {
        it("should return 200 and success response when credential is found", async () => {
            const credentialId = "CRED-001";
            const credentialData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const successResult = AppResponse.success(credentialData);
            mockRequest.params = { id: credentialId };
            mockVerificationService.verifyCredential.mockResolvedValue(successResult);

            await controller.verifyCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockVerificationService.verifyCredential).toHaveBeenCalledWith(credentialId);
            expect(mockVerificationService.verifyCredential).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(successResult);
        });

        it("should return 404 when credential is not found", async () => {
            const credentialId = "CRED-999";
            const errorResult = AppResponse.error("Credential not found");

            mockRequest.params = { id: credentialId };
            mockVerificationService.verifyCredential.mockResolvedValue(errorResult);

            await controller.verifyCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockVerificationService.verifyCredential).toHaveBeenCalledWith(credentialId);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith(errorResult);
        });

        it("should return 400 when service throws an error", async () => {
            const credentialId = "CRED-001";
            const errorResponse = AppResponse.error("Error verifying credential");

            mockRequest.params = { id: credentialId };
            mockVerificationService.verifyCredential.mockRejectedValue(new Error("Service error"));

            await controller.verifyCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockVerificationService.verifyCredential).toHaveBeenCalledWith(credentialId);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(errorResponse);
        });

        it("should handle missing id parameter", async () => {
            const errorResponse = AppResponse.error("Error verifying credential");

            mockRequest.params = {};
            mockVerificationService.verifyCredential.mockRejectedValue(new Error("Credential Id is required"));

            await controller.verifyCredential(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(errorResponse);
        });
    });

    describe("healthCheck", () => {
        it("should return 200 with health check data", async () => {
            const mockDate = new Date("2023-01-01T00:00:00.000Z");
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

            await controller.healthCheck(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                AppResponse.success({
                    service: "verification-service",
                    timestamp: "2023-01-01T00:00:00.000Z",
                })
            );

            jest.restoreAllMocks();
        });
    });
});