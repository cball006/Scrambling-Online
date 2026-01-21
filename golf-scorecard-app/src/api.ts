const API_URL = 'http://127.0.0.1:8080'; // For local dev

async function fetchSessions(): Promise<string[]> {
    const res = await fetch(`${API_URL}/sessions`);
    const data = await res.json();
    return data.sessions.map((s: any) => s.name);
}

async function createSession(name: string, password: string) {
    const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
    });
    return res.json();
}

async function joinSession(name: string, password: string) {
    const res = await fetch(`${API_URL}/sessions/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
    });
    return res.json();
}
