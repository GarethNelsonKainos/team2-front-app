export enum JobRoleStatus {
	OPEN = "Open",
	CLOSED = "Closed",
	IN_PROGRESS = "In Progress",
}

export interface JobRole {
	status?: JobRoleStatus;
	numberOfOpenPositions?: number;
}
