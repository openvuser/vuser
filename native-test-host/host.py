#!/usr/bin/env python3
import sys
import json
import struct
import threading
import http.server
import socketserver
import time
import os

# Debug log – indicates the host process has started
sys.stderr.write('HOST STARTED\n')

# Native Messaging Protocol
def get_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = struct.unpack('@I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message_content):
    encoded_content = json.dumps(message_content).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    sys.stdout.buffer.write(encoded_length)
    sys.stdout.buffer.write(encoded_content)
    sys.stdout.buffer.flush()

# Global variable to store tabs
current_tabs = []
tabs_lock = threading.Lock()

# HTTP Server to serve tabs
class TabRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/tabs':
            self.handle_request("getTabs", {})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/switch':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_request("switchTab", data)
        elif self.path == '/mcp':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_request("callMcp", data)
        elif self.path == '/create':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_request("createTab", data)
        else:
            self.send_response(404)
            self.end_headers()

    def handle_request(self, action, payload):
        request_id = str(time.time())
        message = {"action": action, "id": request_id}
        message.update(payload)
        
        send_message(message)
        
        global pending_requests
        event = threading.Event()
        with tabs_lock:
            pending_requests[request_id] = {'event': event, 'data': None}
        
        if event.wait(timeout=5.0): # Increased timeout for MCP calls
            with tabs_lock:
                data = pending_requests.pop(request_id, None)
                response_data = data['data'] if data else {"error": "No data received"}
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            with tabs_lock:
                pending_requests.pop(request_id, None)
            self.send_response(504)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Timeout waiting for Chrome"}).encode('utf-8'))


pending_requests = {}

def start_server():
    # Use port 0 to let the OS pick an available port, avoiding conflicts.
    try:
        with socketserver.TCPServer(("", 0), TabRequestHandler) as httpd:
            # Store the chosen port for debugging (optional)
            chosen_port = httpd.server_address[1]
            sys.stderr.write(f"HTTP server listening on port {chosen_port}\n")
            httpd.serve_forever()
    except OSError as e:
        # If binding fails, log and continue – the host can still handle native messages.
        sys.stderr.write(f"HTTP server error (ignored): {e}\n")
        # Do not re-raise; the host will keep running for native messaging.


# Start HTTP server in a separate thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Main loop: Read messages from Chrome
while True:
    try:
        msg = get_message()
    # -------------------------------------------------------------------
    # New ping handling – respond immediately to simple ping requests
    # -------------------------------------------------------------------
        if isinstance(msg, dict) and msg.get('cmd') == 'ping':
            # Send a simple reply back to the extension
            send_message({"reply": "pong"})
            continue  # Skip further processing for this ping message
    # -------------------------------------------------------------------
    # Existing handling of messages that contain tab information
    # -------------------------------------------------------------------
        # Handle messages from Chrome
        # We expect responses to our "getTabs" requests
        if 'id' in msg and 'tabs' in msg:
            req_id = msg['id']
            with tabs_lock:
                if req_id in pending_requests:
                    pending_requests[req_id]['data'] = msg['tabs']
                    pending_requests[req_id]['event'].set()
    except Exception as e:
        # Log error (to file since stdout is used for messaging)
        with open("/tmp/native_host_error.log", "a") as f:
            f.write(str(e) + "\n")
        sys.exit(1)
