import axios from "axios";
import type {
	Band,
	Capability,
	CreateJobRolePayload,
	JobRole,
} from "../../models/jobRoleModel.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class JobRoleApiError extends Error {
	status: number;
	errors: string[];

	constructor(status: number, errors: string[]) {
		super(errors.join(", "));
		this.name = "JobRoleApiError";
		this.status = status;
		this.errors = errors;
	}
}

export class JobRoleService {
	async getJobRoles(): Promise<JobRole[]> {
		try {
			const response = await axios.get<JobRole[]>(`${API_BASE_URL}/job-roles`);
			return response.data;
		} catch (error) {
			console.error("Error fetching job roles:", error);
			throw new Error("Failed to fetch job roles");
		}
	}

	async getJobRoleById(id: string): Promise<JobRole> {
		try {
			const response = await axios.get<JobRole>(
				`${API_BASE_URL}/job-roles/${id}`,
			);
			return response.data;
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			throw new Error("Failed to fetch job role");
		}
	}

	async getCapabilities(): Promise<Capability[]> {
		try {
			const response = await axios.get<Capability[]>(
				`${API_BASE_URL}/capabilities`,
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching capabilities:", error);
			throw new Error("Failed to fetch capabilities");
		}
	}

	async getBands(): Promise<Band[]> {
		try {
			const response = await axios.get<Band[]>(`${API_BASE_URL}/bands`);
			return response.data;
		} catch (error) {
			console.error("Error fetching bands:", error);
			throw new Error("Failed to fetch bands");
		}
	}

	async createJobRole(input: CreateJobRolePayload): Promise<JobRole> {
		try {
			const response = await axios.post<JobRole>(
				`${API_BASE_URL}/job-roles`,
				input,
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				const status = error.response.status;
				const responseData = error.response.data;
				const responseErrors =
					responseData?.errors && Array.isArray(responseData.errors)
						? responseData.errors
						: typeof responseData?.error === "string"
							? [responseData.error]
							: ["Failed to create job role"];
				throw new JobRoleApiError(status, responseErrors);
			}

			throw new JobRoleApiError(503, [
				"Cannot connect to server. Please try again.",
			]);
		}
	}
}
