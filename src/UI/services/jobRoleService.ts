import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class JobRoleService {
	async getJobRoles() {
		try {
			const response = await axios.get(`${API_BASE_URL}/job-roles`);
			return response.data;
		} catch (error) {
			console.error("Error fetching job roles:", error);
			throw new Error("Failed to fetch job roles");
		}
	}
}
