import express from "express";

const app = express();
const port = process.env.API_PORT || 3000;

// Mock job roles data - realistic test data matching template structure
const jobRoles = [
	{
		jobRoleId: "1",
		roleName: "Senior Software Engineer",
		description:
			"We are seeking a Senior Software Engineer to lead technical projects and mentor junior developers. You will work with cutting-edge technologies and collaborate with cross-functional teams.",
		responsibilities:
			"Lead development of scalable applications, mentor junior developers, participate in code reviews, and contribute to architectural decisions.",
		location: "Belfast",
		capability: {
			capabilityName: "Software Engineering",
		},
		band: {
			bandName: "Senior",
		},
		closingDate: "2026-03-15",
		statusId: 1,
		numberOfOpenPositions: 2,
		status: { statusName: "Open" },
		sharepointUrl: "https://sharepoint.example.com/job-specs/senior-engineer",
	},
	{
		jobRoleId: "2",
		roleName: "Product Manager",
		description:
			"Drive product strategy and oversee the development of innovative solutions that solve real customer problems.",
		responsibilities:
			"Define product roadmap, gather requirements from stakeholders, manage releases, and analyze product performance metrics.",
		location: "Dublin",
		capability: {
			capabilityName: "Product Management",
		},
		band: {
			bandName: "Senior",
		},
		closingDate: "2026-03-20",
		statusId: 1,
		numberOfOpenPositions: 1,
		status: { statusName: "Closed" },
		sharepointUrl: null,
	},
	{
		jobRoleId: "3",
		roleName: "UX Designer",
		description:
			"Design intuitive and accessible user experiences for our digital products. Create wireframes, prototypes, and user flows.",
		responsibilities:
			"Conduct user research, create design specifications, collaborate with developers, and iterate on designs based on user feedback.",
		location: "Remote",
		capability: {
			capabilityName: "Design",
		},
		band: {
			bandName: "Mid-Level",
		},
		closingDate: "2026-03-10",
		statusId: 1,
		numberOfOpenPositions: 1,
		status: { statusName: "Open" },
		sharepointUrl: "https://sharepoint.example.com/job-specs/ux-designer",
	},
	{
		jobRoleId: "4",
		roleName: "QA Engineer",
		description:
			"Ensure quality and reliability of our applications through comprehensive testing and quality assurance processes.",
		responsibilities:
			"Design test cases, perform manual and automated testing, report bugs, and collaborate with development teams to resolve issues.",
		location: "Belfast",
		capability: {
			capabilityName: "Quality Assurance",
		},
		band: {
			bandName: "Mid-Level",
		},
		closingDate: "2026-02-28",
		statusId: 2,
		numberOfOpenPositions: 0,
		status: { statusName: "Closed" },
		sharepointUrl: null,
	},
	{
		jobRoleId: "5",
		roleName: "DevOps Engineer",
		description:
			"Manage infrastructure and deployment pipelines for cloud-based applications. Design and maintain CI/CD systems.",
		responsibilities:
			"Automate deployment processes, manage cloud infrastructure, monitor system performance, and implement security best practices.",
		location: "Remote",
		capability: {
			capabilityName: "Infrastructure",
		},
		band: {
			bandName: "Senior",
		},
		closingDate: "2026-03-25",
		statusId: 1,
		numberOfOpenPositions: 3,
		status: { statusName: "Open" },
		sharepointUrl: "https://sharepoint.example.com/job-specs/devops-engineer",
	},
];

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all job roles with optional filtering by status
app.get("/job-roles", (req, res) => {
	try {
		const statusName = req.query.statusName;

		if (statusName && typeof statusName === "string") {
			const filtered = jobRoles.filter(
				(role) => role.status.toLowerCase() === statusName.toLowerCase(),
			);
			return res.json(filtered);
		}

		res.json(jobRoles);
	} catch (error) {
		console.error("Error fetching job roles:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get a specific job role by ID
app.get("/job-roles/:id", (req, res) => {
	try {
		const { id } = req.params;

		if (!id || typeof id !== "string" || id.trim() === "") {
			return res.status(400).json({ error: "Invalid or missing job role ID" });
		}

		const role = jobRoles.find((r) => r.jobRoleId === id);

		if (!role) {
			return res.status(404).json({ error: "Job role not found" });
		}

		res.json(role);
	} catch (error) {
		console.error(`Error fetching job role with id ${req.params.id}:`, error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
	console.log(`Mock API backend running on port ${port}`);
});
