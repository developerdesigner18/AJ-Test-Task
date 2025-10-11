import React, { useState } from "react";
import { FileText, Shield } from "lucide-react";
import IssueCredential from "./components/IssueCredential";
import VerifyCredential from "./components/VerifyCredential";

type TabType = "issue" | "verify";

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("issue");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Credential Management System
                </h1>

                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab("issue")}
                            aria-label="issue-tab-btn"
                            className={`flex-1 py-4 px-6 text-center font-medium transition ${
                                activeTab === "issue"
                                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <FileText className="inline-block mr-2" size={20} />
                            Issue Credential
                        </button>
                        <button
                            onClick={() => setActiveTab("verify")}
                            aria-label="verify-tab-btn"
                            className={`flex-1 py-4 px-6 text-center font-medium transition ${
                                activeTab === "verify"
                                    ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Shield className="inline-block mr-2" size={20} />
                            Verify Credential
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "issue" ? (
                            <IssueCredential />
                        ) : (
                            <VerifyCredential />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
