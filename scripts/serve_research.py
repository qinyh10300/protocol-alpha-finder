"""Local API and production SPA server. Serves only allowlisted research artifacts."""
import argparse
import json
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote
from research_adapter import ROOT, ARTIFACTS, normalize


class Handler(BaseHTTPRequestHandler):
    def send(self, status, data, content_type='application/json; charset=utf-8'):
        body = data if isinstance(data, bytes) else json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            path = unquote(urlparse(self.path).path)
            parts = path.strip('/').split('/')
            if path.startswith('/api/artifacts/'):
                key = parts[-1]
                if key not in ARTIFACTS:
                    return self.send(404, {'error': 'Unknown artifact'})
                f = ROOT / 'data' / ARTIFACTS[key]
                return self.send(200, f.read_bytes(), 'application/json; charset=utf-8' if f.suffix == '.json' else 'text/plain; charset=utf-8')
            if path.startswith('/api/reports/'):
                report = next((r for r in normalize()['reports'] if r['id'] == parts[-1]), None)
                return self.send(200, report) if report else self.send(404, {'error': 'Report not found'})
            if path.startswith('/api/research-runs/'):
                run_id = parts[2]
                if not run_id.startswith('local-'):
                    return self.send(404, {'error': 'Run not found'})
                data = normalize(seed_id=run_id[6:])
                key = parts[3] if len(parts) > 3 else 'run'
                if key == 'snapshot':
                    return self.send(200, data)
                if key not in {'run', 'wallets', 'candidates', 'reports', 'activity'}:
                    return self.send(404, {'error': 'Unknown endpoint'})
                return self.send(200, data[key])
            if path.startswith('/api/'):
                return self.send(404, {'error': 'Unknown endpoint'})
            dist = (ROOT / 'dist').resolve()
            f = (dist / path.lstrip('/')).resolve()
            if not f.is_relative_to(dist):
                return self.send(403, {'error': 'Forbidden'})
            if not f.is_file():
                if path in ['/', '/research', '/reports', '/frontend/'] or path.startswith('/reports/'):
                    f = dist / 'index.html'
                else:
                    return self.send(404, {'error': 'Not found'})
            if not f.exists():
                return self.send(503, {'error': 'Build the frontend with npm run build, or use npm run dev.'})
            return self.send(200, f.read_bytes(), mimetypes.guess_type(f.name)[0] or 'application/octet-stream')
        except FileNotFoundError as e:
            self.send(503, {'error': f'Skill artifact unavailable: {e.filename}. Restore local data or switch to Demo mode.'})
        except (ValueError, KeyError, TypeError) as e:
            self.send(422, {'error': f'Cannot load research handoff: {e}'})

    def do_POST(self):
        # Creating an archive run means opening a normalized view of existing evidence.
        if urlparse(self.path).path != '/api/research-runs':
            return self.send(404, {'error': 'Unknown endpoint'})
        try:
            size = int(self.headers.get('Content-Length', 0))
            if not 0 < size < 4096:
                return self.send(400, {'error': 'Invalid request size'})
            body = json.loads(self.rfile.read(size))
            if body.get('mode', 'archive') != 'archive':
                return self.send(400, {'error': 'This server imports saved Skill results only.'})
            self.send(200, normalize(seed_id=body.get('seedId', 'all'))['run'])
        except FileNotFoundError:
            self.send(503, {'error': 'Saved Skill results unavailable. Use Demo mode or restore data/.'})
        except (ValueError, KeyError, TypeError) as e:
            self.send(422, {'error': str(e)})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5174)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Research API: http://127.0.0.1:{args.port}', flush=True)
    server.serve_forever()
