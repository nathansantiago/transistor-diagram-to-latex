package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
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

func componentsHandler(c *gin.Context) {

}

func exportHandler(c *gin.Context) {

}
