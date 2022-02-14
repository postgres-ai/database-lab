module gitlab.com/postgres-ai/database-lab/v3

go 1.17

require (
	github.com/AlekSi/pointer v1.1.0
	github.com/araddon/dateparse v0.0.0-20210207001429-0eec95c9db7e
	github.com/aws/aws-sdk-go v1.33.8
	github.com/docker/cli v20.10.12+incompatible
	github.com/docker/docker v20.10.12+incompatible
	github.com/docker/go-connections v0.4.0
	github.com/docker/go-units v0.4.0
	github.com/dustin/go-humanize v1.0.0
	github.com/google/go-github/v34 v34.0.0
	github.com/gorilla/mux v1.8.0
	github.com/gorilla/websocket v1.4.2
	github.com/jackc/pgtype v1.5.0
	github.com/jackc/pgx/v4 v4.9.0
	github.com/lib/pq v1.8.0
	github.com/pkg/errors v0.9.1
	github.com/robfig/cron/v3 v3.0.1
	github.com/rs/xid v1.2.1
	github.com/sergi/go-diff v1.1.0
	github.com/sethvargo/go-password v0.2.0
	github.com/shirou/gopsutil v2.20.9+incompatible
	github.com/stretchr/testify v1.7.0
	github.com/testcontainers/testcontainers-go v0.11.1
	github.com/urfave/cli/v2 v2.1.1
	golang.org/x/crypto v0.0.0-20210322153248-0c34fe9e7dc2
	golang.org/x/oauth2 v0.0.0-20200107190931-bf48bf16ab8d
	gopkg.in/yaml.v2 v2.4.0
)

require (
	github.com/Azure/go-ansiterm v0.0.0-20170929234023-d6e3b3328b78 // indirect
	github.com/Microsoft/go-winio v0.4.17 // indirect
	github.com/Microsoft/hcsshim v0.8.23 // indirect
	github.com/StackExchange/wmi v0.0.0-20190523213315-cbe66965904d // indirect
	github.com/cenkalti/backoff v2.2.1+incompatible // indirect
	github.com/containerd/cgroups v1.0.1 // indirect
	github.com/containerd/containerd v1.5.9 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.0 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/docker/distribution v2.8.0+incompatible // indirect
	github.com/go-ole/go-ole v1.2.4 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/groupcache v0.0.0-20200121045136-8c9f03a8e57e // indirect
	github.com/golang/protobuf v1.5.0 // indirect
	github.com/google/go-querystring v1.0.0 // indirect
	github.com/google/uuid v1.2.0 // indirect
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgconn v1.7.0 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.0.5 // indirect
	github.com/jackc/pgservicefile v0.0.0-20200714003250-2b9c44734f2b // indirect
	github.com/jmespath/go-jmespath v0.3.0 // indirect
	github.com/moby/sys/mount v0.3.0 // indirect
	github.com/moby/sys/mountinfo v0.5.0 // indirect
	github.com/moby/term v0.0.0-20201216013528-df9cb8a40635 // indirect
	github.com/morikuni/aec v1.0.0 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.0.2 // indirect
	github.com/opencontainers/runc v1.0.2 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.0.1 // indirect
	github.com/shurcooL/sanitized_anchor_name v1.0.0 // indirect
	github.com/sirupsen/logrus v1.8.1 // indirect
	github.com/stretchr/objx v0.2.0 // indirect
	go.opencensus.io v0.22.3 // indirect
	golang.org/x/net v0.0.0-20211108170745-6635138e15ea // indirect
	golang.org/x/sys v0.0.0-20211109184856-51b60fd695b3 // indirect
	golang.org/x/text v0.3.7 // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/appengine v1.6.5 // indirect
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
	google.golang.org/grpc v1.38.0 // indirect
	google.golang.org/protobuf v1.27.1 // indirect
	gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c // indirect
)

// Include the single version of the dependency to clean up go.sum from old revisions.
// Since old and indirect dependencies are listed in the sum file and the vulnerability scanner flags the project as containing vulnerabilities.
replace (
	github.com/containerd/containerd => github.com/containerd/containerd v1.5.9 // mitigate CVE-2021-32760 and CVE-2020-15257
	github.com/coreos/etcd => github.com/coreos/etcd v3.3.27+incompatible // mitigate CVE-2020-15113 and CVE-2020-15112
	github.com/docker/docker => github.com/docker/docker v20.10.12+incompatible // mitigate CVE-2018-20699
	github.com/gogo/protobuf => github.com/gogo/protobuf v1.3.2 // mitigate CVE-2021-3121
	github.com/opencontainers/image-spec => github.com/opencontainers/image-spec v1.0.2 // mitigate CVE-2021-41190
	github.com/opencontainers/runc => github.com/opencontainers/runc v1.0.3 // mitigate CVE-2021-30465
	golang.org/x/crypto => golang.org/x/crypto v0.0.0-20210322153248-0c34fe9e7dc2 // mitigate CVE-2018-16875 and CVE-2020-29652
	k8s.io/kubernetes v1.13.0 => k8s.io/kubernetes v1.23.3 // mitigate CVE-2020-8559 and CVE-2020-8565
)
