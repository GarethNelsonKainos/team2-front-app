import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class JobRoleService {
	async getJobRoles(token: string | null) {
		try {
			const headers: any = {};

			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await axios.get(`${API_BASE_URL}/job-roles`, {
				headers,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching job roles:", error);
			throw new Error("Failed to fetch job roles");
		}
	}

	async getJobRoleById(id: string, token: string | null) {
		try {
			const headers: any = {};

			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await axios.get(`${API_BASE_URL}/job-roles/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			throw new Error("Failed to fetch job role");
		}
	}
}
