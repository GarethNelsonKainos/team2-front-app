import { describe, expect, it } from "vitest";
import {
	loginSchema,
	registrationSchema,
} from "../../../src/validationSchema/authValidation";

describe("auth validation schemas", () => {
	it("accepts valid login input", async () => {
		await expect(
			loginSchema.validate({
				email: "user@test.com",
				password: "Password123!",
			}),
		).resolves.toBeTruthy();
	});

	it("rejects login input with invalid email", async () => {
		await expect(
			loginSchema.validate({
				email: "invalid-email",
				password: "Password123!",
			}),
		).rejects.toThrow("Invalid email format");
	});

	it("rejects login input with missing fields", async () => {
		await expect(
			loginSchema.validate({
				email: "",
				password: "",
			}),
		).rejects.toThrow("Password is required");
	});

	it("accepts valid registration input", async () => {
		await expect(
			registrationSchema.validate({
				firstName: "Alex",
				secondName: "Parker",
				email: "alex@example.com",
				password: "StrongPass!1",
				confirmedPassword: "StrongPass!1",
			}),
		).resolves.toBeTruthy();
	});

	it("rejects registration with missing fields", async () => {
		await expect(
			registrationSchema.validate({
				firstName: "",
				secondName: "",
				email: "",
				password: "",
				confirmedPassword: "",
			}),
		).rejects.toThrow("Password confirmation is required");
	});

	it("rejects registration with invalid email", async () => {
		await expect(
			registrationSchema.validate({
				firstName: "Alex",
				secondName: "Parker",
				email: "invalid-email",
				password: "StrongPass!1",
				confirmedPassword: "StrongPass!1",
			}),
		).rejects.toThrow("Invalid email format");
	});

	it("rejects registration input with weak password", async () => {
		await expect(
			registrationSchema.validate({
				firstName: "Alex",
				secondName: "Parker",
				email: "alex@example.com",
				password: "weakpass",
				confirmedPassword: "weakpass",
			}),
		).rejects.toThrow("Password must be more than 8 characters");
	});

	it("rejects registration when passwords do not match", async () => {
		await expect(
			registrationSchema.validate({
				firstName: "Alex",
				secondName: "Parker",
				email: "alex@example.com",
				password: "StrongPass!1",
				confirmedPassword: "OtherPass!1",
			}),
		).rejects.toThrow("Passwords must match");
	});
});
