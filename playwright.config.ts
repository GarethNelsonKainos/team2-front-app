import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const bddTestDir = defineBddConfig({
	features: "tests/features/**/*.feature",
	steps: "tests/steps/**/*.ts",
	outputDir: "tests/bdd-gen",
});

export default defineConfig({
	use: {
		baseURL: "http://localhost:3001",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "e2e",
			use: { ...devices["Desktop Chrome"] },
			testDir: "tests",
			testMatch: ["**/*.spec.ts", "**/*.test.ts"],
			testIgnore: [
				"**/features/**",
				"**/steps/**",
				"**/pages/**",
				"**/support/**",
				"**/bdd-gen/**",
			],
		},
		{
			name: "bdd",
			use: { ...devices["Desktop Chrome"] },
			testDir: bddTestDir,
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3001",
		reuseExistingServer: !process.env.CI,
	},
});
