import axios from 'axios';

export class JobRoleService {
    async getJobRoles() {
        try {
            const response = await axios.get('http://localhost:3000/job-roles');
            return response.data;
        } catch (error) {
            console.error('Error fetching job roles:', error);
            throw new Error('Failed to fetch job roles');
        }
    }
}