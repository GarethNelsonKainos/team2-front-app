import axios from "axios";
import * as yup from "yup";
import {
	loginSchema,
	registrationSchema,
} from "../validationSchema/authValidation.js";
import type RegistrationRequest from "../types/RegistrationRequest.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class AuthService {
	async login(email: string, password: string) {
		try {
			// Validate input
			await loginSchema.validate({ email, password });

			const response = await axios.post(`${API_BASE_URL}/login`, {
				email,
				password,
			});
			return response.data;
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				return { error: error.message, status: 400, fieldErrors: error.inner };
			}
			if (axios.isAxiosError(error)) {
				return {
					status: 500,
					error: "An error occurred during login. Please try again.",
				};
			}
			return {
				error: "An unexpected error occurred. Please try again.",
				status: 500,
			};
		}
	}

	async register(registrationRequest: RegistrationRequest) {
		try {
			// Validate input
			await registrationSchema.validate(registrationRequest);

			const response = await axios.post(`${API_BASE_URL}/register`, {
				firstName: registrationRequest.firstName,
				secondName: registrationRequest.secondName,
				email: registrationRequest.email,
				password: registrationRequest.password,
				confirmedPassword: registrationRequest.confirmedPassword,
			});

			return response.data;
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				return { error: error.message, status: 400, fieldErrors: error.inner };
			}
			if (axios.isAxiosError(error)) {
				return {
					status: 500,
					error: "An error occurred during registration. Please try again.",
				};
			}
			return {
				error: "An unexpected error occurred. Please try again.",
				status: 500,
			};
		}
	}

	async userRoleFlag(token: string, userId: string) {
		try {
			await axios.get(`${API_BASE_URL}/admin/job-roles/${userId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return true;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 403) {
				return false;
			}
			console.error("Error checking user role:", error);
			return false;
		}
	}
}
