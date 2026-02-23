package export

import (
	"fmt"
	"math"
	"strings"

	"github.com/nathansantiago/transistor-diagram-to-latex/backend/models"
)

// ComponentMapping maps component types to CircuiTikZ syntax
var ComponentMapping = map[string]string{
	// Transistors
	"npn":  "npn",
	"pnp":  "pnp",
	"nmos": "nmos",
	"pmos": "pmos",

	// Passive components
	"resistor":  "R",
	"capacitor": "C",
	"inductor":  "L",

	// Sources
	"dc_voltage": "battery1",
	"dc_current": "isource",
	"ac_voltage": "sV",
	"battery":    "battery",

	// Semiconductors
	"diode": "D",
	"led":   "leDo",
	"zener": "zDo",

	// Basic
	"ground":   "ground",
	"rground":  "rground",
	"junction": "circ",

	// Active components
	"opamp":  "op amp",
	"switch": "switch",
}

// Exporter handles LaTeX generation
type Exporter struct {
	scale float64
}

// NewExporter creates a new exporter with custom scale
func NewExporter(scale float64) *Exporter {
	if scale == 0 {
		scale = 50.0 // Default: 50 pixels = 1 TikZ unit
	}
	return &Exporter{scale: scale}
}

// ExportToLaTeX converts a diagram to CircuiTikZ LaTeX code
func (e *Exporter) ExportToLaTeX(diagram models.Diagram, includeHeader bool) (string, error) {
	var sb strings.Builder

	if includeHeader {
		sb.WriteString("\\documentclass{article}\n")
		sb.WriteString("\\usepackage{circuitikz}\n")
		sb.WriteString("\\begin{document}\n\n")
	}

	sb.WriteString("\\begin{circuitikz}\n")

	// Create component map for quick lookup
	componentMap := make(map[string]models.Component)
	for _, comp := range diagram.Components {
		componentMap[comp.ID] = comp
	}

	// Generate draw commands for connections
	if len(diagram.Connections) > 0 {
		for _, conn := range diagram.Connections {
			if err := e.writeConnection(&sb, conn, componentMap); err != nil {
				return "", fmt.Errorf("error writing connection %s: %w", conn.ID, err)
			}
		}
	}

	// Handle disconnected components (not in any connection)
	connectedComps := make(map[string]bool)
	for _, conn := range diagram.Connections {
		connectedComps[conn.Source.ComponentID] = true
		connectedComps[conn.Target.ComponentID] = true
	}

	for _, comp := range diagram.Components {
		if !connectedComps[comp.ID] {
			e.writeStandaloneComponent(&sb, comp)
		}
	}

	sb.WriteString("\\end{circuitikz}\n")

	if includeHeader {
		sb.WriteString("\n\\end{document}\n")
	}

	return sb.String(), nil
}

// writeConnection writes a single connection with its components
func (e *Exporter) writeConnection(sb *strings.Builder, conn models.Connection, componentMap map[string]models.Component) error {
	srcComp, srcExists := componentMap[conn.Source.ComponentID]
	tgtComp, tgtExists := componentMap[conn.Target.ComponentID]

	if !srcExists || !tgtExists {
		return fmt.Errorf("component not found in connection")
	}

	// Calculate the start and end coordinates based on the source component
	// We want to draw FROM the opposite side of the source TO the connection port
	startCoord := e.getOppositePortCoordinate(srcComp, conn.Source.Position)
	endCoord := e.getPortCoordinate(srcComp, conn.Source.Position)

	sb.WriteString("  \\draw ")
	sb.WriteString(e.formatCoordinate(startCoord))
	sb.WriteString("\n")

	// Draw the SOURCE component along this connection
	tikzComp := e.getTikzComponent(srcComp)

	sb.WriteString(fmt.Sprintf("    to[%s", tikzComp))

	// Add label if exists
	if srcComp.Label != "" {
		sb.WriteString(fmt.Sprintf(", l=$%s$", srcComp.Label))
	} else if srcComp.Value != "" {
		sb.WriteString(fmt.Sprintf(", l=$%s$", srcComp.Value))
	}

	sb.WriteString("] ")
	sb.WriteString(e.formatCoordinate(endCoord))

	// Add waypoints if they exist
	if len(conn.Waypoints) > 0 {
		for _, wp := range conn.Waypoints {
			sb.WriteString("\n    -- ")
			sb.WriteString(e.formatCoordinate(wp))
		}
	}

	// Connect to target
	tgtCoord := e.getPortCoordinate(tgtComp, conn.Target.Position)

	// Check if target is a node-type component (ground, junction, etc.)
	if e.isNodeComponent(tgtComp.Type) {
		sb.WriteString("\n    -- ")
		sb.WriteString(e.formatCoordinate(tgtCoord))
		sb.WriteString(fmt.Sprintf(" node[%s] {}", e.getTikzComponent(tgtComp)))
	} else {
		// Otherwise just connect with a wire
		sb.WriteString("\n    -- ")
		sb.WriteString(e.formatCoordinate(tgtCoord))
	}

	sb.WriteString(";\n")

	return nil
}

// writeStandaloneComponent writes a component not connected to anything
func (e *Exporter) writeStandaloneComponent(sb *strings.Builder, comp models.Component) {
	coord := models.Point{X: comp.X, Y: comp.Y}
	tikzComp := e.getTikzComponent(comp)

	sb.WriteString(fmt.Sprintf("  \\draw %s node[%s] ",
		e.formatCoordinate(e.toTikzCoordinate(coord)), tikzComp))

	if comp.Label != "" {
		sb.WriteString(fmt.Sprintf("{$%s$}", comp.Label))
	} else {
		sb.WriteString("{}")
	}
	sb.WriteString(";\n")
}

// getTikzComponent returns the CircuiTikZ component name
func (e *Exporter) getTikzComponent(comp models.Component) string {
	if tikzName, exists := ComponentMapping[comp.Type]; exists {
		return tikzName
	}
	return "generic" // Fallback
}

// getPortCoordinate calculates the actual coordinate of a port
func (e *Exporter) getPortCoordinate(comp models.Component, position string) models.Point {
	// Base component position
	coord := models.Point{X: comp.X, Y: comp.Y}

	// Offset based on port position (assuming component size ~40px)
	offset := 20.0
	switch position {
	case "left":
		coord.X -= offset
	case "right":
		coord.X += offset
	case "top":
		coord.Y -= offset
	case "bottom":
		coord.Y += offset
	}

	return e.toTikzCoordinate(coord)
}

// getOppositePortCoordinate returns the coordinate on the opposite side of a component
func (e *Exporter) getOppositePortCoordinate(comp models.Component, position string) models.Point {
	oppositePosition := ""
	switch position {
	case "left":
		oppositePosition = "right"
	case "right":
		oppositePosition = "left"
	case "top":
		oppositePosition = "bottom"
	case "bottom":
		oppositePosition = "top"
	default:
		oppositePosition = "left" // Default fallback
	}
	return e.getPortCoordinate(comp, oppositePosition)
}

// isNodeComponent returns true if the component should be rendered as a node, not a path element
func (e *Exporter) isNodeComponent(componentType string) bool {
	nodeComponents := map[string]bool{
		"ground":   true,
		"rground":  true,
		"junction": true,
	}
	return nodeComponents[componentType]
}

// toTikzCoordinate converts canvas pixels to TikZ units
func (e *Exporter) toTikzCoordinate(p models.Point) models.Point {
	return models.Point{
		X: p.X / e.scale,
		Y: -p.Y / e.scale, // Invert Y axis (canvas grows down, TikZ grows up)
	}
}

// formatCoordinate formats a coordinate for LaTeX
func (e *Exporter) formatCoordinate(p models.Point) string {
	return fmt.Sprintf("(%.2f,%.2f)",
		math.Round(p.X*100)/100,
		math.Round(p.Y*100)/100)
}
