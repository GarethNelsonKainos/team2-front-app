import axios from "axios";
import fs from "fs";
import FormData from "form-data";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class ApplicationService {
	async processApplication({ jobRoleId, userId, file }: { jobRoleId: string, userId: string, file: Express.Multer.File }) {
		console.log("[processApplication] Start");
		console.log("[processApplication] jobRoleId:", jobRoleId);
		console.log("[processApplication] userId:", userId);
		console.log("[processApplication] file:", file);
		const form = new FormData();
		form.append("jobRoleId", jobRoleId);
		form.append("userId", userId);
		form.append("CV", file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype
		});
		try {
			console.log("[processApplication] Sending POST to backend API");
			const response = await axios.post(`${API_BASE_URL}/createApplication`, form, {
				headers: {
					...form.getHeaders(),
				},
				maxContentLength: Infinity,
				maxBodyLength: Infinity
			});
			console.log("[processApplication] Backend API response:", response.data);
			return response.data;
		} catch (err) {
			console.error("[processApplication] Error posting to backend API:", err);
			throw err;
		}
	}
}
