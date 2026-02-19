type JobRoleStatus = {
	statusName?: string;
};

export type JobRole = {
	status?: JobRoleStatus;
};

export type Capability = {
	capabilityId: string;
	capabilityName: string;
};

export type Band = {
	bandId: string;
	bandName: string;
};

export type CreateJobRoleFormData = {
	roleName: string;
	description: string;
	sharepointUrl: string;
	responsibilities: string;
	numberOfOpenPositions: string;
	location: string;
	closingDate: string;
	capabilityId: string;
	bandId: string;
};

export type CreateJobRolePayload = {
	roleName: string;
	description: string;
	sharepointUrl: string;
	responsibilities: string;
	numberOfOpenPositions: number;
	location: string;
	closingDate: string;
	capabilityId: string;
	bandId: string;
};

export type CreateJobRoleFieldErrors = Partial<
	Record<keyof CreateJobRoleFormData, string>
>;

export const EMPTY_FORM_DATA: CreateJobRoleFormData = {
	roleName: "",
	description: "",
	sharepointUrl: "",
	responsibilities: "",
	numberOfOpenPositions: "",
	location: "",
	closingDate: "",
	capabilityId: "",
	bandId: "",
};

export const buildCreateJobRolePayload = (
	formData: CreateJobRoleFormData,
): CreateJobRolePayload => {
	const parsedNumberOfOpenPositions = Number.parseInt(
		formData.numberOfOpenPositions,
		10,
	);

	return {
		roleName: formData.roleName,
		description: formData.description,
		sharepointUrl: formData.sharepointUrl,
		responsibilities: formData.responsibilities,
		numberOfOpenPositions: Number.isNaN(parsedNumberOfOpenPositions)
			? 1
			: parsedNumberOfOpenPositions,
		location: formData.location,
		closingDate: formData.closingDate,
		capabilityId: formData.capabilityId,
		bandId: formData.bandId,
	};
};
