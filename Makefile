.DEFAULT_GOAL = all

SERVER_BINARY = dblab-server
CLI_BINARY = dblab
GOARCH = amd64

VERSION?=0.3.1
BUILD_TIME?=$(shell date -u '+%Y%m%d-%H%M')
COMMIT?=no #$(shell git rev-parse HEAD)
BRANCH?=no #$(shell git rev-parse --abbrev-ref HEAD)

# Symlink into GOPATH
BUILD_DIR=${GOPATH}/${SERVER_BINARY}

# Setup the -ldflags option for go build here, interpolate the variable values
LDFLAGS = -ldflags "-s -w \
	-X gitlab.com/postgres-ai/database-lab/version.version=${VERSION} \
	-X main.commit=${COMMIT} \
	-X main.branch=${BRANCH}\
	-X gitlab.com/postgres-ai/database-lab/version.buildTime=${BUILD_TIME}"

# Go tooling command aliases
GOBUILD = GO111MODULE=on GOARCH=${GOARCH} go build ${LDFLAGS}
GOTEST = GO111MODULE=on go test -race 
GORUN = GO111MODULE=on go run ${LDFLAGS}

CLIENT_PLATFORMS=darwin linux freebsd windows
ARCHITECTURES=amd64

# Build the project
all: clean build

# Install the linter to $GOPATH/bin which is expected to be in $PATH
install-lint:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.22.2

run-lint:
	golangci-lint run

lint: install-lint run-lint

build:
	${GOBUILD} -o bin/${SERVER_BINARY} ./cmd/database-lab/main.go
	${GOBUILD} -o bin/${CLI_BINARY} ./cmd/cli/main.go

build-client:
	$(foreach GOOS, $(CLIENT_PLATFORMS),\
		$(foreach GOARCH, $(ARCHITECTURES), \
		$(shell \
			export GOOS=$(GOOS); \
			export GOARCH=$(GOARCH); \
			go build -o bin/cli/$(CLI_BINARY)-$(GOOS)-$(GOARCH) ./cmd/cli/main.go)))

test:
	${GOTEST} ./...

fmt:
	go fmt $$(go list ./... | grep -v /vendor/)

clean:
	rm -f bin/*

run:
	${GORUN} ./cmd/database-lab/*

.PHONY: all build test run-lint install-lint lint fmt clean run
