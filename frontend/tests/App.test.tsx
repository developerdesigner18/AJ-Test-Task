import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "../src/App";

// Helper function to render component
const renderComponent = () => {
    return render(<App />);
};

describe("App Component", () => {
    describe("Rendering", () => {
        it("should render the main heading", () => {
            renderComponent();

            expect(
                screen.getByRole("heading", {
                    name: /credential management system/i,
                })
            ).toBeInTheDocument();
        });

        it("should render both tab buttons", () => {
            renderComponent();

            expect(screen.getByLabelText("issue-tab-btn")).toBeInTheDocument();

            expect(screen.getByLabelText("verify-tab-btn")).toBeInTheDocument();
        });

        it("should default to Issue Credential tab", () => {
            renderComponent();
            expect(
                screen.queryByLabelText("issue-tab-content")
            ).toBeInTheDocument();
            expect(
                screen.queryByLabelText("verify-tab-content")
            ).not.toBeInTheDocument();
        });
    });

    describe("Tab Navigation", () => {
        it("should switch to Verify Credential tab when clicked", async () => {
            renderComponent();
            const btn = screen.getByLabelText("verify-tab-btn");
            await userEvent.click(btn);
            expect(
                screen.getByLabelText("verify-tab-content")
            ).toBeInTheDocument();
        });

        it("should toggle between tabs multiple times correctly", async () => {
            renderComponent();
            const verifyBtn = screen.getByLabelText("verify-tab-btn");
            await userEvent.click(verifyBtn);
            expect(
                screen.getByLabelText("verify-tab-content")
            ).toBeInTheDocument();
            const issueBtn = screen.getByLabelText("issue-tab-btn");
            await userEvent.click(issueBtn);
            expect(
                screen.getByLabelText("issue-tab-content")
            ).toBeInTheDocument();
        });
    });
});
