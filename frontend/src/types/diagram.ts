export interface Point {
	x: number;
	y: number;
}

export interface Component {
	id: string;
	type: ComponentType;
	x: number;
	y: number;
	rotation: number; // 0, 90, 180, 270
	label: string;
	value: string;
	style?: string;
	props?: Record<string, unknown>;
}

export interface Port {
	componentId: string;
	position: "left" | "right" | "top" | "bottom";
}

export interface Connection {
	id: string;
	source: Port;
	target: Port;
	waypoints?: Point[];
}

export interface Diagram {
	components: Component[];
	connections: Connection[];
	gridSize: number;
	zoom: number;
	metadata?: Metadata;
}

export interface Metadata {
	title?: string;
	description?: string;
	author?: string;
	version?: string;
}

export interface ExportRequest {
	diagram: Diagram;
	includeHeader: boolean;
	scale: number;
}

export interface ExportResponse {
	latex: string;
	success: boolean;
	errors?: string[];
}

// Component types matching backend
export type ComponentType =
	// Transistors
	| "npn"
	| "pnp"
	| "nmos"
	| "pmos"
	// Passive components
	| "resistor"
	| "capacitor"
	| "inductor"
	// Sources
	| "dc_voltage"
	| "dc_current"
	| "ac_voltage"
	| "battery"
	// Semiconductors
	| "diode"
	| "led"
	| "zener"
	// Basic
	| "ground"
	| "rground"
	| "junction"
	// Active components
	| "opamp"
	| "switch";

export interface ComponentDefinition {
	type: ComponentType;
	name: string;
	category:
		| "transistor"
		| "passive"
		| "source"
		| "semiconductor"
		| "basic"
		| "active";
	defaultLabel: string;
	tikz: string;
}
