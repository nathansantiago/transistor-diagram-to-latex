import { create } from "zustand";
import type { Component, Connection } from "../types/diagram";

interface CanvasState {
	// Canvas properties
	stageScale: number;
	stageX: number;
	stageY: number;
	gridSize: number;

	// Diagram data
	components: Component[];
	connections: Connection[];

	// Selection state
	selectedComponentIds: string[];
	selectedConnectionIds: string[];

	// Tool state
	activeTool: "select" | "wire" | "delete";
	wireStartPort: {
		componentId: string;
		position: "left" | "right" | "top" | "bottom";
	} | null;

	// History for undo/redo
	history: Array<{ components: Component[]; connections: Connection[] }>;
	historyIndex: number;

	// Actions
	setStageScale: (scale: number) => void;
	setStagePosition: (x: number, y: number) => void;

	addComponent: (component: Omit<Component, "id">) => void;
	updateComponent: (id: string, updates: Partial<Component>) => void;
	deleteComponent: (id: string) => void;

	addConnection: (connection: Omit<Connection, "id">) => void;
	deleteConnection: (id: string) => void;

	setSelectedComponents: (ids: string[]) => void;
	setSelectedConnections: (ids: string[]) => void;
	clearSelection: () => void;

	setActiveTool: (tool: "select" | "wire" | "delete") => void;
	setWireStartPort: (
		port: {
			componentId: string;
			position: "left" | "right" | "top" | "bottom";
		} | null,
	) => void;

	snapToGrid: (value: number) => number;

	undo: () => void;
	redo: () => void;
	saveToHistory: () => void;

	clear: () => void;
}

let nextComponentId = 1;
let nextConnectionId = 1;

export const useDiagramStore = create<CanvasState>((set, get) => ({
	// Initial state
	stageScale: 1,
	stageX: 0,
	stageY: 0,
	gridSize: 50,

	components: [],
	connections: [],

	selectedComponentIds: [],
	selectedConnectionIds: [],

	activeTool: "select",
	wireStartPort: null,

	history: [{ components: [], connections: [] }],
	historyIndex: 0,

	// Canvas actions
	setStageScale: (scale) =>
		set({ stageScale: Math.max(0.1, Math.min(5, scale)) }),

	setStagePosition: (x, y) => set({ stageX: x, stageY: y }),

	// Component actions
	addComponent: (component) => {
		const id = `comp_${nextComponentId++}`;
		const newComponent = { ...component, id };

		set((state) => ({
			components: [...state.components, newComponent],
		}));

		get().saveToHistory();
	},

	updateComponent: (id, updates) => {
		set((state) => ({
			components: state.components.map((comp) =>
				comp.id === id ? { ...comp, ...updates } : comp,
			),
		}));

		get().saveToHistory();
	},

	deleteComponent: (id) => {
		set((state) => ({
			components: state.components.filter((comp) => comp.id !== id),
			connections: state.connections.filter(
				(conn) =>
					conn.source.componentId !== id && conn.target.componentId !== id,
			),
			selectedComponentIds: state.selectedComponentIds.filter(
				(selectedId) => selectedId !== id,
			),
		}));

		get().saveToHistory();
	},

	// Connection actions
	addConnection: (connection) => {
		const id = `conn_${nextConnectionId++}`;
		const newConnection = { ...connection, id };

		set((state) => ({
			connections: [...state.connections, newConnection],
		}));

		get().saveToHistory();
	},

	deleteConnection: (id) => {
		set((state) => ({
			connections: state.connections.filter((conn) => conn.id !== id),
			selectedConnectionIds: state.selectedConnectionIds.filter(
				(selectedId) => selectedId !== id,
			),
		}));

		get().saveToHistory();
	},

	// Selection actions
	setSelectedComponents: (ids) => set({ selectedComponentIds: ids }),

	setSelectedConnections: (ids) => set({ selectedConnectionIds: ids }),

	clearSelection: () =>
		set({ selectedComponentIds: [], selectedConnectionIds: [] }),

	// Tool actions
	setActiveTool: (tool) => set({ activeTool: tool, wireStartPort: null }),

	setWireStartPort: (port) => set({ wireStartPort: port }),

	// Utility
	snapToGrid: (value) => {
		const { gridSize } = get();
		return Math.round(value / gridSize) * gridSize;
	},

	// History actions
	saveToHistory: () => {
		const { components, connections, history, historyIndex } = get();

		// Remove any history after current index (when making changes after undo)
		const newHistory = history.slice(0, historyIndex + 1);

		// Add new state
		newHistory.push({
			components: JSON.parse(JSON.stringify(components)),
			connections: JSON.parse(JSON.stringify(connections)),
		});

		// Limit history to 50 entries
		if (newHistory.length > 50) {
			newHistory.shift();
		} else {
			set({ historyIndex: historyIndex + 1 });
		}

		set({ history: newHistory });
	},

	undo: () => {
		const { history, historyIndex } = get();

		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			const state = history[newIndex];

			set({
				components: JSON.parse(JSON.stringify(state.components)),
				connections: JSON.parse(JSON.stringify(state.connections)),
				historyIndex: newIndex,
			});
		}
	},

	redo: () => {
		const { history, historyIndex } = get();

		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			const state = history[newIndex];

			set({
				components: JSON.parse(JSON.stringify(state.components)),
				connections: JSON.parse(JSON.stringify(state.connections)),
				historyIndex: newIndex,
			});
		}
	},

	clear: () => {
		set({
			components: [],
			connections: [],
			selectedComponentIds: [],
			selectedConnectionIds: [],
			history: [{ components: [], connections: [] }],
			historyIndex: 0,
		});
	},
}));
