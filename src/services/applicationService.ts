import axios from "axios";
import FormData from "form-data";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const maxLength = 10 * 1024 * 1024; // 10MB

export class ApplicationService {
	async processApplication({
		jobRoleId,
		userId,
		file,
		token,
	}: {
		jobRoleId: string;
		userId: string;
		file: Express.Multer.File;
		token: string;
	}) {
		const form = new FormData();
		form.append("jobRoleId", jobRoleId);
		form.append("userId", userId);
		form.append("CV", file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype,
		});
		try {
			const response = await axios.post(`${API_BASE_URL}/application`, form, {
				headers: {
					...form.getHeaders(),
					Authorization: `Bearer ${token}`,
				},
				maxContentLength: maxLength,
				maxBodyLength: maxLength,
			});
			return response.data;
		} catch (err) {
			console.error("[processApplication] Error posting to backend API:", err);
			throw err;
		}
	}

	async getUserApplications(token: string) {
		try {
			const response = await axios.get(`${API_BASE_URL}/myApplications`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
		} catch (err) {
			console.error("[getUserApplications] Error fetching applications:", err);
			throw err;
		}
	}
}
