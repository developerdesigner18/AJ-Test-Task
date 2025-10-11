import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IssueCredential from "../src/components/IssueCredential";

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to render component
const renderComponent = (props = {}) => {
    return render(<IssueCredential {...props} />);
};

describe("IssueCredential Component", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockFormData = {
        credentialId: "CERT-2024-001",
        holderName: "John Doe",
        holderEmail: "john@example.com",
        credentialType: "Degree Certificate",
    };

    const fillForm = async (data = mockFormData) => {
        await user.type(screen.getByTestId("credentialId"), data.credentialId);
        await user.type(screen.getByTestId("holderName"), data.holderName);
        await user.type(screen.getByTestId("holderEmail"), data.holderEmail);
        await user.type(
            screen.getByTestId("credentialType"),
            data.credentialType
        );
    };

    const inputTestIds = [
        "credentialId",
        "holderName",
        "holderEmail",
        "credentialType",
    ];
    describe("Rendering", () => {
        it("should render all form fields correctly", () => {
            renderComponent();
            for (const id of inputTestIds) {
                expect(screen.getByTestId(id)).toBeInTheDocument();
            }
        });

        it("should render with empty initial state", () => {
            renderComponent();
            for (const id of inputTestIds) {
                expect(screen.getByTestId(id)).toHaveValue("");
            }
        });
    });

    describe("Form Interactions", () => {
        it("should update form fields when user types", async () => {
            renderComponent();
            for (const id of inputTestIds) {
                await act(async () => {
                    await user.type(screen.getByTestId(id), "TEST");
                });
                await waitFor(() => {
                    expect(screen.getByTestId(id)).toHaveValue("TEST");
                });
            }
        });

        it("should enable submit button when all required fields are filled", async () => {
            renderComponent();

            const submitButton = screen.getByRole("button", {
                name: /issue credential/i,
            });
            expect(submitButton).toBeDisabled();
            await act(async () => {
                await fillForm();
            });
            await waitFor(() => {
                expect(submitButton).toBeEnabled();
            });
        });
    });

    describe("Form Submission", () => {
        it("should submit form successfully with correct payload", async () => {
            const mockResponse = {
                status: "success",
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
                screen.getByRole("button", { name: /issue credential/i })
            );

            expect(global.fetch).toHaveBeenCalled();

            await waitFor(() => {
                expect(screen.getByText("Success!")).toBeInTheDocument();
            });

            expect(screen.getByText(/CERT-2024-001/)).toBeInTheDocument();
            expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        });

        it("should handle already issued credential response", async () => {
            const mockResponse = {
                status: "already_issued",
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
                screen.getByRole("button", { name: /issue credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Already Issued")).toBeInTheDocument();
            });
        });

        it("should handle server error response", async () => {
            const mockResponse = {
                status: "error",
                message: "Internal server error",
            };

            vi.mocked(global.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /issue credential/i })
            );

            await waitFor(() => {
                expect(screen.getByText("Error")).toBeInTheDocument();
            });

            expect(
                screen.getByText("Internal server error")
            ).toBeInTheDocument();
        });

        it("should handle network failure", async () => {
            vi.mocked(global.fetch).mockRejectedValueOnce(
                new Error("Network error")
            );

            renderComponent();
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /issue credential/i })
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
            await fillForm();

            await user.click(
                screen.getByRole("button", { name: /issue credential/i })
            );

            expect(screen.getByText("Issuing...")).toBeInTheDocument();
            expect(screen.getByRole("button")).toBeDisabled();

            await waitFor(() => {
                expect(
                    screen.queryByText("Issuing...")
                ).not.toBeInTheDocument();
            });
        });
    });
});
