import axios from "axios";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export async function loginUser(email: string, password: string) {
	try {
		const response = await axios.post(`${API_BASE_URL}/login`, {
			email,
			password,
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				switch (error.response.status) {
					case 401:
						return { error: "Invalid email or password", status: 401 };
					case 404:
						return { error: "Login endpoint not available", status: 404 };
					case 500:
						return {
							error: "Server error. Please try again later.",
							status: 500,
						};
					default:
						return { error: "Login failed. Please try again.", status: 400 };
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
