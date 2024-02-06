#!/bin/bash
GIT_TAG=`git name-rev --name-only --tags HEAD`
VERSION=$GIT_TAG
if [[ "$GIT_TAG" == "undefined" ]]; then
	VERSION=git-`git rev-parse --short HEAD`
fi
echo $VERSION
