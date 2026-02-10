
export class JobRoleService {
    async getJobRoles() {
        // Mock data
        return [
            {
                roleName: "Software Engineer",
                location: "Belfast",
                capability: "Engineering",
                band: "5",
                closingDate: "20/03/2026"
            },
            {
                roleName: "QA Analyst",
                location: "London",
                capability: "Quality Assurance",
                band: "4",
                closingDate: "15/03/2026"
            }
        ];
    }
}