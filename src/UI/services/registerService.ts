import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export async function registerUser(
	firstName: string,
	secondName: string,
	email: string,
	password: string,
	confirmedPassword: string,
) {
	try {
		const response = await axios.post(`${API_BASE_URL}/register`, {
			firstName,
			secondName,
			email,
			password,
			confirmedPassword,
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				switch (error.response.status) {
					case 400:
						return {
							error: error.response.data.error || "Invalid registration data",
							status: 400,
						};
					case 409:
						return { error: "Email already registered", status: 409 };
					case 404:
						return {
							error: "Registration endpoint not available",
							status: 404,
						};
					case 500:
						return {
							error: "Server error. Please try again later.",
							status: 500,
						};
					default:
						return {
							error: "Registration failed. Please try again.",
							status: 400,
						};
				}
			} else if (error.request) {
				return {
					error: "Cannot connect to server. Please check your connection.",
					status: 503,
				};
			}
		}
		return {
			error: "An unexpected error occurred. Please try again.",
			status: 500,
		};
	}
}
