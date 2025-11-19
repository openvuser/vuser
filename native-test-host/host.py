#!/usr/bin/env python3
import sys
import json
import struct
import threading
import http.server
import socketserver
import time
import os

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
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Request tabs from Chrome
            # We can't easily wait for the response here in a simple way without more complex sync,
            # so for this MVP we will return the *last known* tabs or trigger a fetch and return what we have.
            # Better approach: Trigger fetch, wait for update (with timeout), then return.
            
            request_id = str(time.time())
            send_message({"action": "getTabs", "id": request_id})
            
            # Wait for response (simple polling for demo purposes)
            # In a real app, use a Condition variable or Event.
            # For now, we'll just sleep a bit or return the cached tabs if we maintain them.
            # But we don't maintain them yet.
            # Let's use a Condition.
            
            # Actually, since the host is single-process, we need to be careful.
            # The main thread is reading stdin. The HTTP server is in a separate thread.
            # We can use a shared dictionary to store pending requests.
            
            global pending_requests
            event = threading.Event()
            with tabs_lock:
                pending_requests[request_id] = {'event': event, 'data': None}
            
            if event.wait(timeout=2.0):
                with tabs_lock:
                    data = pending_requests.pop(request_id, None)
                    response_data = data['data'] if data else []
            else:
                response_data = {"error": "Timeout waiting for Chrome"}
                with tabs_lock:
                    pending_requests.pop(request_id, None)

            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

pending_requests = {}

def start_server():
    PORT = 8080
    with socketserver.TCPServer(("", PORT), TabRequestHandler) as httpd:
        httpd.serve_forever()

# Start HTTP server in a separate thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Main loop: Read messages from Chrome
while True:
    try:
        msg = get_message()
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
