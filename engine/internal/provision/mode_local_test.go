package provision

import (
	"context"
	"testing"
	"time"

	"github.com/docker/docker/client"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"gitlab.com/postgres-ai/database-lab/v3/internal/provision/pool"
	"gitlab.com/postgres-ai/database-lab/v3/internal/provision/resources"
	"gitlab.com/postgres-ai/database-lab/v3/internal/provision/thinclones"

	"gitlab.com/postgres-ai/database-lab/v3/pkg/models"
)

func TestPortAllocation(t *testing.T) {
	cfg := &Config{
		PortPool: PortPool{
			From: 6000,
			To:   6002,
		},
	}

	p, err := New(context.Background(), cfg, &resources.DB{}, &client.Client{}, &pool.Manager{}, "instanceID", "networkID")
	require.NoError(t, err)

	// Allocate a new port.
	port, err := p.allocatePort()
	require.NoError(t, err)

	assert.GreaterOrEqual(t, port, p.config.PortPool.From)
	assert.LessOrEqual(t, port, p.config.PortPool.To)

	// Allocate one more port.
	_, err = p.allocatePort()
	require.NoError(t, err)

	// Impossible allocate a new port.
	_, err = p.allocatePort()
	assert.IsType(t, errors.Cause(err), &NoRoomError{})
	assert.EqualError(t, err, "session cannot be started because there is no room: no available ports")

	// Free port and allocate a new one.
	require.NoError(t, p.FreePort(port))
	port, err = p.allocatePort()
	require.NoError(t, err)
	assert.GreaterOrEqual(t, port, p.config.PortPool.From)
	assert.LessOrEqual(t, port, p.config.PortPool.To)

	// Try to free a non-existing port.
	err = p.FreePort(1)
	assert.EqualError(t, err, "port 1 is out of bounds of the port pool")
}

type mockFSManager struct {
	pool      *resources.Pool
	cloneList []string
}

func (m mockFSManager) CreateClone(name, snapshotID string) error {
	return nil
}

func (m mockFSManager) DestroyClone(name string) error {
	return nil
}

func (m mockFSManager) ListClonesNames() ([]string, error) {
	return m.cloneList, nil
}

func (m mockFSManager) CreateSnapshot(poolSuffix, dataStateAt string) (snapshotName string, err error) {
	return "", nil
}

func (m mockFSManager) DestroySnapshot(snapshotName string) (err error) {
	return nil
}

func (m mockFSManager) CleanupSnapshots(retentionLimit int) ([]string, error) {
	return nil, nil
}

func (m mockFSManager) SnapshotList() []resources.Snapshot {
	return nil
}

func (m mockFSManager) RefreshSnapshotList() {
}

func (m mockFSManager) GetSessionState(name string) (*resources.SessionState, error) {
	return nil, nil
}

func (m mockFSManager) GetFilesystemState() (models.FileSystem, error) {
	return models.FileSystem{Mode: "zfs"}, nil
}

func (m mockFSManager) Pool() *resources.Pool {
	return m.pool
}

func (m mockFSManager) InitBranching() error {
	return nil
}

func (m mockFSManager) VerifyBranchMetadata() error {
	return nil
}

func (m mockFSManager) CreateBranch(_, _ string) error {
	return nil
}

func (m mockFSManager) Snapshot(_ string) error {
	return nil
}

func (m mockFSManager) Reset(_ string, _ thinclones.ResetOptions) error {
	return nil
}

func (m mockFSManager) ListBranches() (map[string]string, error) {
	return nil, nil
}

func (m mockFSManager) AddBranchProp(_, _ string) error {
	return nil
}

func (m mockFSManager) DeleteBranchProp(_, _ string) error {
	return nil
}

func (m mockFSManager) SetRelation(_, _ string) error {
	return nil
}

func (m mockFSManager) SetRoot(_, _ string) error {
	return nil
}

func (m mockFSManager) GetRepo() (*models.Repo, error) {
	return nil, nil
}

func (m mockFSManager) SetDSA(_, _ string) error {
	return nil
}

func (m mockFSManager) SetMessage(_, _ string) error {
	return nil
}

func (m mockFSManager) SetMountpoint(_, _ string) error {
	return nil
}

func (m mockFSManager) Rename(_, _ string) error {
	return nil
}

func (m mockFSManager) DeleteBranch(_ string) error {
	return nil
}

func (m mockFSManager) DeleteChildProp(_, _ string) error {
	return nil
}

func (m mockFSManager) DeleteRootProp(_, _ string) error {
	return nil
}

func TestBuildPoolEntry(t *testing.T) {
	testCases := []struct {
		pool          *resources.Pool
		poolStatus    resources.PoolStatus
		cloneList     []string
		expectedEntry models.PoolEntry
	}{
		{
			pool: &resources.Pool{
				Name: "TestPool",
				Mode: "zfs",
				DSA:  time.Date(2021, 8, 1, 0, 0, 0, 0, time.UTC),
			},
			poolStatus: resources.ActivePool,
			cloneList:  []string{"test_clone_0001", "test_clone_0002"},
			expectedEntry: models.PoolEntry{
				Name:        "TestPool",
				Mode:        "zfs",
				DataStateAt: &models.LocalTime{Time: time.Date(2021, 8, 01, 0, 0, 0, 0, time.UTC)},
				Status:      resources.ActivePool,
				CloneList:   []string{"test_clone_0001", "test_clone_0002"},
				FileSystem:  models.FileSystem{Mode: "zfs"},
			},
		},
		{
			pool: &resources.Pool{
				Name: "TestPoolWithoutDSA",
				Mode: "zfs",
			},
			poolStatus: resources.EmptyPool,
			cloneList:  []string{},
			expectedEntry: models.PoolEntry{
				Name:        "TestPoolWithoutDSA",
				Mode:        "zfs",
				DataStateAt: &models.LocalTime{},
				Status:      resources.EmptyPool,
				CloneList:   []string{},
				FileSystem:  models.FileSystem{Mode: "zfs"},
			},
		},
	}

	for _, tc := range testCases {
		p := tc.pool
		p.SetStatus(tc.poolStatus)

		testFSManager := mockFSManager{
			pool:      p,
			cloneList: tc.cloneList,
		}

		poolEntry, err := buildPoolEntry(testFSManager)
		assert.Nil(t, err)
		assert.Equal(t, tc.expectedEntry, poolEntry)
	}
}

func TestParsingDockerImage(t *testing.T) {
	t.Run("Parse PostgreSQL version from tags of a Docker image", func(t *testing.T) {
		testCases := []struct {
			image           string
			expectedVersion string
		}{
			{
				image:           "postgresai/extended-postgres:11",
				expectedVersion: "11",
			},
			{
				image:           "postgresai/extended-postgres:11-alpine",
				expectedVersion: "11",
			},
			{
				image:           "postgresai/extended-postgres:alpine",
				expectedVersion: "",
			},
			{
				image:           "internal.example.com:5000/pg:9.6-ext",
				expectedVersion: "9.6",
			},
		}

		for _, tc := range testCases {
			version := parseImageVersion(tc.image)
			assert.Equal(t, tc.expectedVersion, version)
		}
	})
}
