#!/usr/bin/env python3
"""Play the four cuts as a playlist in a browser.

    python3 tools/playlist/serve.py [port]      # default 8765, then open http://localhost:8765/

Serves this folder's page and the files in out/video and out/covers, on
localhost only, with range requests so the player can seek. On a remote
machine, VS Code forwards the port: `"$BROWSER" http://localhost:8765/` in its
terminal opens the page on the workstation.
"""
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

KIT = Path(__file__).resolve().parents[2]
ROOTS = {
    "video": KIT / "out" / "video",
    "covers": KIT / "out" / "covers",
    "fonts": KIT / "scene" / "fonts",
}
PAGE = Path(__file__).with_name("index.html")
TYPES = {".mp4": "video/mp4", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".html": "text/html; charset=utf-8"}
NAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*")


class Handler(BaseHTTPRequestHandler):
    def resolve(self):
        path = unquote(urlsplit(self.path).path)
        if path in ("/", "/index.html"):
            return PAGE
        parts = path.strip("/").split("/")
        if len(parts) == 2 and parts[0] in ROOTS and NAME.fullmatch(parts[1]):
            f = ROOTS[parts[0]] / parts[1]
            if f.is_file():
                return f
        return None

    def do_HEAD(self):
        self.serve(head=True)

    def do_GET(self):
        self.serve(head=False)

    def serve(self, head):
        f = self.resolve()
        if not f:
            self.send_error(404)
            return
        size = f.stat().st_size
        start, end, status = 0, size - 1, 200
        m = re.fullmatch(r"bytes=(\d*)-(\d*)", (self.headers.get("Range") or "").strip())
        if m and (m.group(1) or m.group(2)):
            if m.group(1):
                start = int(m.group(1))
                end = min(int(m.group(2)), size - 1) if m.group(2) else size - 1
            else:
                start = max(0, size - int(m.group(2)))
            if start > end:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return
            status = 206
        self.send_response(status)
        self.send_header("Content-Type", TYPES.get(f.suffix, "application/octet-stream"))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        if head:
            return
        with open(f, "rb") as fh:
            fh.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    chunk = fh.read(min(1 << 16, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"serving on http://localhost:{port}/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
