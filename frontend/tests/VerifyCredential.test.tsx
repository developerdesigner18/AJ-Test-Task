import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import VerifyCredential from "../src/components/VerifyCredential";

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to render component
const renderComponent = (props = {}) => {
    return render(<VerifyCredential {...props} />);
};

describe("VerifyCredential Component", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockFormData = {
        credentialId: "CERT-2024-001",
    };

    const fillForm = async (data = mockFormData) => {
        await user.type(screen.getByTestId("credentialId"), data.credentialId);
    };

    describe("Rendering", () => {
        it("should render all form fields correctly", () => {
            renderComponent();
            expect(screen.getByTestId("credentialId")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /verify credential/i })
            ).toBeInTheDocument();
        });

        it("should render with empty initial state", () => {
            renderComponent();
            expect(screen.getByTestId("credentialId")).toHaveValue("");
        });
    });

    describe("Form Interactions", () => {
        it("should update form fields when user types", async () => {
            renderComponent();
            const input = screen.getByTestId("credentialId");

            await act(async () => {
                await user.type(input, mockFormData.credentialId);
            });

            await waitFor(() => {
                expect(input).toHaveValue(mockFormData.credentialId);
            });
        });

        it("should enable submit button when credential ID is provided", async () => {
            renderComponent();

            const submitButton = screen.getByRole("button", {
                name: /verify credential/i,
            });
            expect(submitButton).toBeDisabled();

            await user.type(screen.getByTestId("credentialId"), "TEST-123");

            expect(submitButton).toBeEnabled();
        });
    });

    describe("Form Submission", () => {
        it("should submit form successfully with valid credential response", async () => {
            const mockResponse = {
                status: "success",
                message: "Credential verified successfully",
                data: {
                    credentialId: "CERT-2024-001",
                    holderName: "John Doe",
                    holderEmail: "john@example.com",
                    credentialType: "Degree Certificate",
                },
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            expect(global.fetch).toHaveBeenCalled();

            await waitFor(() => {
                expect(screen.getByText("Success!")).toBeInTheDocument();
            });

            expect(screen.getByText(/CERT-2024-001/)).toBeInTheDocument();
            expect(screen.getByText(/John Doe/)).toBeInTheDocument();
            expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
        });

        it("should handle already issued credential response", async () => {
            const mockResponse = {
                status: "already_issued",
                message: "This credential has already been issued",
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Already Issued")).toBeInTheDocument();
            });

            expect(
                screen.getByText("This credential has already been issued")
            ).toBeInTheDocument();
        });

        it("should handle error response", async () => {
            const mockResponse = {
                status: "error",
                message: "Credential not found",
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Error")).toBeInTheDocument();
            });

            expect(
                screen.getByText("Credential not found")
            ).toBeInTheDocument();
        });

        it("should handle network failure", async () => {
            vi.mocked(global.fetch).mockRejectedValueOnce(
                new Error("Network error")
            );

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Error")).toBeInTheDocument();
            });

            expect(
                screen.getByText(/Failed to connect to server: Network error/)
            ).toBeInTheDocument();
        });

        it("should show loading state during submission", async () => {
            vi.mocked(global.fetch).mockImplementationOnce(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: async () => ({
                                        status: "success",
                                        message: "Success",
                                    }),
                                } as Response),
                            100
                        )
                    )
            );

            renderComponent();
            await user.type(
                screen.getByPlaceholderText(/e.g., CERT-2024-001/i),
                "TEST-123"
            );

            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            expect(screen.getByText("Verifying...")).toBeInTheDocument();
            expect(screen.getByRole("button")).toBeDisabled();

            await waitFor(() => {
                expect(
                    screen.queryByText("Verifying...")
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("Response Display", () => {
        it("should display credential details when present", async () => {
            const mockResponse = {
                status: "success",
                message: "Credential verified successfully",
                data: {
                    credentialId: "CERT-2024-001",
                    holderName: "John Doe",
                    holderEmail: "john@example.com",
                    credentialType: "Degree Certificate",
                },
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();
            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Success!")).toBeInTheDocument();
            });

            expect(screen.getByText(/Credential ID:/)).toBeInTheDocument();
            expect(screen.getByText(/CERT-2024-001/)).toBeInTheDocument();
            expect(screen.getByText(/Holder:/)).toBeInTheDocument();
            expect(screen.getByText(/John Doe/)).toBeInTheDocument();
            expect(screen.getByText(/Email:/)).toBeInTheDocument();
            expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
            expect(screen.getByText(/Type:/)).toBeInTheDocument();
            expect(screen.getByText(/Degree Certificate/)).toBeInTheDocument();
        });

        it("should not display credential section when no data is present", async () => {
            const mockResponse = {
                status: "error",
                message: "Credential not found",
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();
            await user.click(
                screen.getByRole("button", { name: /verify credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Error")).toBeInTheDocument();
            });

            expect(
                screen.queryByText(/Credential ID:/)
            ).not.toBeInTheDocument();
        });
    });
});
