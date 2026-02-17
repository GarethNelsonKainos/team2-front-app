import axios from "axios";
import FormData from "form-data";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class ApplicationService {
	async processApplication({
		jobRoleId,
		userId,
		file,
	}: {
		jobRoleId: string;
		userId: string;
		file: Express.Multer.File;
	}) {
		const form = new FormData();
		form.append("jobRoleId", jobRoleId);
		form.append("userId", userId);
		form.append("CV", file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype,
		});
		try {
			const response = await axios.post(
				`${API_BASE_URL}/createApplication`,
				form,
				{
					headers: {
						...form.getHeaders(),
					},
					maxContentLength: 10 * 1024 * 1024,
					maxBodyLength: 10 * 1024 * 1024,
				},
			);
			return response.data;
		} catch (err) {
			console.error("[processApplication] Error posting to backend API:", err);
			throw err;
		}
	}
}
