#!/bin/bash
# Install Native Messaging Host

HOST_NAME="org.vuser.protocol.host"
TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"

mkdir -p "$TARGET_DIR"
cp "native-test-host/$HOST_NAME.json" "$TARGET_DIR/"

# Update the path in the manifest to be absolute
# (Already absolute in the file, but good to ensure)
# SED command to replace path if needed, but for now we hardcoded it.

echo "Native Messaging Host installed to $TARGET_DIR"
chmod +x native-test-host/host.py
