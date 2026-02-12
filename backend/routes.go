package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nathansantiago/transistor-diagram-to-latex/backend/export"
	"github.com/nathansantiago/transistor-diagram-to-latex/backend/models"
)

func setupRoutes(r *gin.Engine) {
	r.Use(corsMiddleware())

	r.GET("/api/health", healthHandler)

	r.GET("/api/components", componentsHandler)

	r.POST("/api/export", exportHandler)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		c.Next()
	}
}

// healthHandler returns server health status
func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "transistor-diagram-to-latex",
		"version": "1.0.0",
	})
}

func exportHandler(c *gin.Context) {
	var req models.ExportRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ExportResponse{
			Success: false,
			Errors:  []string{err.Error()},
		})
		return
	}

	if len(req.Diagram.Components) == 0 {
		c.JSON(http.StatusBadRequest, models.ExportResponse{
			Success: false,
			Errors:  []string{"diagram must contain at least one component"},
		})
		return
	}

	// Create exporter with custom scale
	scale := req.Scale
	if scale == 0 {
		scale = 50.0 // Default scale
	}
	exporter := export.NewExporter(scale)

	// Generate LaTeX
	latex, err := exporter.ExportToLaTeX(req.Diagram, req.IncludeHeader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ExportResponse{
			Success: false,
			Errors:  []string{err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, models.ExportResponse{
		Success: true,
		LaTeX:   latex,
	})
}

func componentsHandler(c *gin.Context) {
	components := make([]gin.H, 0, len(export.ComponentMapping))

	for compType, tikzName := range export.ComponentMapping {
		components = append(components, gin.H{
			"type": compType,
			"tikz": tikzName,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"components": components,
		"count":      len(components),
	})
}
