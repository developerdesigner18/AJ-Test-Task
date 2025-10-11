import type { Config } from "jest";

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    moduleNameMapper: {
        "^@src/(.*)$": "<rootDir>/src/$1",
    },
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    forceExit: true,
};

export default config;
