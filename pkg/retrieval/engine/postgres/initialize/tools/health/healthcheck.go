/*
2020 © Postgres.ai
*/

// Package health provides tools to set up container health check options.
package health

import (
	"time"

	"github.com/docker/docker/api/types/container"

	"gitlab.com/postgres-ai/database-lab/pkg/retrieval/engine/postgres/initialize/tools/defaults"
)

const (
	// Defines container health check options.
	hcInterval    = 5 * time.Second
	hcTimeout     = 2 * time.Second
	hcStartPeriod = 3 * time.Second
	hcRetries     = 5
)

// ContainerOption defines a function to overwrite default options.
type ContainerOption func(h *container.HealthConfig)

// GetConfig builds a container health config
func GetConfig(options ...ContainerOption) *container.HealthConfig {
	healthConfig := &container.HealthConfig{
		Test:        []string{"CMD-SHELL", "pg_isready -U " + defaults.Username},
		Interval:    hcInterval,
		Timeout:     hcTimeout,
		StartPeriod: hcStartPeriod,
		Retries:     hcRetries,
	}

	for _, healthCheckOption := range options {
		healthCheckOption(healthConfig)
	}

	return healthConfig
}

// OptionRetries allows overwrite retries counter.
func OptionRetries(retries int) ContainerOption {
	return func(h *container.HealthConfig) {
		h.Retries = retries
	}
}

// OptionInterval allows overwrite a health check interval.
func OptionInterval(interval time.Duration) ContainerOption {
	return func(h *container.HealthConfig) {
		h.Interval = interval
	}
}