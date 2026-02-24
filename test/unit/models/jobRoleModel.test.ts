import { describe, expect, it } from "vitest";
import { buildCreateJobRolePayload } from "../../../src/models/jobRoleModel";

describe("buildCreateJobRolePayload", () => {
	it("maps form data to payload and parses number of open positions", () => {
		const payload = buildCreateJobRolePayload({
			roleName: "Software Engineer",
			description: "Build high quality software",
			sharepointUrl: "https://example.sharepoint.com/job-role",
			responsibilities: "Coding, reviews, mentoring",
			numberOfOpenPositions: "3",
			location: "Belfast",
			closingDate: "2026-12-31",
			capabilityId: "cap-1",
			bandId: "band-2",
		});

		expect(payload).toEqual({
			roleName: "Software Engineer",
			description: "Build high quality software",
			sharepointUrl: "https://example.sharepoint.com/job-role",
			responsibilities: "Coding, reviews, mentoring",
			numberOfOpenPositions: 3,
			location: "Belfast",
			closingDate: "2026-12-31",
			capabilityId: "cap-1",
			bandId: "band-2",
		});
	});

	it("defaults number of open positions to 1 when value is not numeric", () => {
		const payload = buildCreateJobRolePayload({
			roleName: "Software Engineer",
			description: "Build high quality software",
			sharepointUrl: "https://example.sharepoint.com/job-role",
			responsibilities: "Coding, reviews, mentoring",
			numberOfOpenPositions: "not-a-number",
			location: "Belfast",
			closingDate: "2026-12-31",
			capabilityId: "cap-1",
			bandId: "band-2",
		});

		expect(payload.numberOfOpenPositions).toBe(1);
	});
});
