package models

// Component represents a circuit component on the canvas
type Component struct {
	ID       string                 `json:"id" binding:"required"`
	Type     string                 `json:"type" binding:"required"`
	X        float64                `json:"x" binding:"required"`
	Y        float64                `json:"y" binding:"required"`
	Rotation int                    `json:"rotation"` // 0, 90, 180, 270
	Label    string                 `json:"label"`
	Value    string                 `json:"value"`
	Style    string                 `json:"style"` // e.g., "european", "american"
	Props    map[string]interface{} `json:"props,omitempty"`
}

// Port represents a connection point on a component
type Port struct {
	ComponentID string `json:"componentId" binding:"required"`
	Position    string `json:"position"` // "left", "right", "top", "bottom"
}

// Connection represents a wire between two components
type Connection struct {
	ID        string  `json:"id" binding:"required"`
	Source    Port    `json:"source" binding:"required"`
	Target    Port    `json:"target" binding:"required"`
	Waypoints []Point `json:"waypoints,omitempty"` // For manual routing
}

// Point represents an X,Y coordinate
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Diagram represents the complete circuit diagram
type Diagram struct {
	Components  []Component  `json:"components" binding:"required"`
	Connections []Connection `json:"connections" binding:"required"`
	GridSize    int          `json:"gridSize"`
	Zoom        float64      `json:"zoom"`
	Metadata    Metadata     `json:"metadata,omitempty"`
}

// Metadata contains diagram information
type Metadata struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Author      string `json:"author,omitempty"`
	Version     string `json:"version,omitempty"`
}

// ExportRequest represents the API request for LaTeX export
type ExportRequest struct {
	Diagram       Diagram `json:"diagram" binding:"required"`
	IncludeHeader bool    `json:"includeHeader"` // Include full LaTeX document
	Scale         float64 `json:"scale"`         // Coordinate scale factor (default: 50px = 1 unit)
}

// ExportResponse represents the API response
type ExportResponse struct {
	LaTeX   string   `json:"latex"`
	Success bool     `json:"success"`
	Errors  []string `json:"errors,omitempty"`
}
