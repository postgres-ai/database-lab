/*
2019 © Postgres.ai
*/

// Package util provides utility functions. Config related utils.
package util

import (
	"fmt"
	"os"
	"path"
	"path/filepath"

	"github.com/pkg/errors"
)

const (
	swaggerUIDir = "swagger-ui"
	apiDir       = "api"
	configDir    = "configs"
	standardDir  = "standard"
	metaDir      = "meta"
	logsDir      = "logs"
)

// GetBinRootPath return path to root directory of the current binary module.
func GetBinRootPath() (string, error) {
	binDir, err := os.Getwd()
	if err != nil {
		return "", errors.Wrap(err, "failed to get path of work directory")
	}

	binPath, err := filepath.Abs(binDir)
	if err != nil {
		return "", errors.Wrap(err, "failed to get abs filepath of root directory")
	}

	return binPath, nil
}

// GetSwaggerUIPath return swagger UI path.
func GetSwaggerUIPath() (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", errors.Wrap(err, "cannot get binary root directory")
	}

	return path.Join(dir, apiDir, swaggerUIDir), nil
}

// GetAPIPath return swagger UI path.
func GetAPIPath() (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", errors.Wrap(err, "cannot get binary root directory")
	}

	return path.Join(dir, apiDir), nil
}

// GetStandardConfigPath return path to file in the directory of standard configs.
func GetStandardConfigPath(name string) (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", errors.Wrap(err, "failed to get abs filepath of root directory")
	}

	return path.Join(dir, standardDir, name), nil
}

// GetConfigPath return path to configuration file.
func GetConfigPath(name string) (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", errors.Wrap(err, "failed to get abs filepath of root directory")
	}

	return path.Join(dir, configDir, name), nil
}

// GetMetaPath return path to metadata directory.
func GetMetaPath(name string) (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", errors.Wrap(err, "failed to get abs filepath of root directory")
	}

	return path.Join(dir, metaDir, name), nil
}

// GetLogsRoot returns the root log directory.
func GetLogsRoot() (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", fmt.Errorf("failed to get root directory %w", err)
	}

	return path.Join(dir, logsDir), nil
}

// GetLogsPath returns the log directory path on a specific collection date.
func GetLogsPath(name string) (string, error) {
	dir, err := GetBinRootPath()
	if err != nil {
		return "", fmt.Errorf("failed to get root directory %w", err)
	}

	return path.Join(dir, logsDir, name), nil
}
