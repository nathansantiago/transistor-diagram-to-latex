import type { ExportRequest, ExportResponse, Diagram } from "../types/diagram";

const API_BASE_URL = "http://localhost:8080";

class ApiClient {
	async exportToLaTeX(
		diagram: Diagram,
		includeHeader: boolean = false,
		scale: number = 50,
	): Promise<ExportResponse> {
		const request: ExportRequest = {
			diagram,
			includeHeader,
			scale,
		};

		const response = await fetch(`${API_BASE_URL}/api/export`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async getHealth(): Promise<{
		status: string;
		service: string;
		version: string;
	}> {
		const response = await fetch(`${API_BASE_URL}/api/health`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async getComponentLibrary(): Promise<any> {
		const response = await fetch(`${API_BASE_URL}/api/components`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}
}

export const apiClient = new ApiClient();
