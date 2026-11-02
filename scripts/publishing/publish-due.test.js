const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const http = require("node:http");
const { test } = require("node:test");

const SCRIPT = require("node:path").join(__dirname, "publish-due.js");

function runPublisher(baseUrl, args = [], extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], {
      env: {
        ...process.env,
        SUPABASE_URL: baseUrl,
        SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
        ...extraEnv,
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function withFakeSupabase(handler, run) {
  const requests = [];
  const server = http.createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    const record = {
      method: request.method,
      url: new URL(request.url, "http://localhost"),
      body: body ? JSON.parse(body) : null,
    };
    requests.push(record);
    handler(record, response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    return await run(`http://127.0.0.1:${address.port}`, requests);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function json(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(value));
}

test("publishes new scheduled rows and legacy draft rows in due-date order", async () => {
  await withFakeSupabase(
    (request, response) => {
      if (request.method === "GET" && request.url.searchParams.get("status") === "eq.scheduled") {
        return json(response, 200, [
          {
            id: "scheduled-id",
            slug: "scheduled-post",
            publish_at: "2026-10-27T00:00:00Z",
            published_at: null,
            categories: { slug: "news" },
          },
        ]);
      }
      if (request.method === "GET" && request.url.searchParams.get("status") === "eq.draft") {
        return json(response, 200, [
          {
            id: "legacy-id",
            slug: "legacy-post",
            publish_at: null,
            published_at: "2026-10-26T00:00:00Z",
            categories: { slug: "guides" },
          },
        ]);
      }
      if (request.method === "PATCH") {
        return json(response, 200, [{ id: request.url.searchParams.get("id").slice(3) }]);
      }
      return json(response, 404, { error: "unexpected request" });
    },
    async (baseUrl, requests) => {
      const result = await runPublisher(baseUrl);
      assert.equal(result.code, 0, result.stderr);
      assert.match(result.stdout, /legacy-post[\s\S]*scheduled-post/);

      const patches = requests.filter((request) => request.method === "PATCH");
      assert.equal(patches.length, 2);
      assert.equal(patches[0].url.searchParams.get("status"), "eq.draft");
      assert.deepEqual(patches[0].body, { status: "published" });
      assert.equal(patches[1].url.searchParams.get("status"), "eq.scheduled");
      assert.equal(patches[1].body.status, "published");
      assert.equal(typeof patches[1].body.published_at, "string");
      assert.equal(patches[1].body.publish_at, null);
    }
  );
});

test("dry run discovers both queue formats without updating either", async () => {
  await withFakeSupabase(
    (request, response) => {
      if (request.method === "GET") {
        const scheduled = request.url.searchParams.get("status") === "eq.scheduled";
        return json(response, 200, [
          scheduled
            ? { id: "one", slug: "scheduled-post", publish_at: "2020-01-01T00:00:00Z", categories: null }
            : { id: "two", slug: "legacy-post", published_at: "2020-01-02T00:00:00Z", categories: null },
        ]);
      }
      return json(response, 500, { error: "dry run must not patch" });
    },
    async (baseUrl, requests) => {
      const result = await runPublisher(baseUrl, ["--dry-run"]);
      assert.equal(result.code, 0, result.stderr);
      assert.match(result.stdout, /2 post\(s\) due/);
      assert.match(result.stdout, /Dry run: nothing was changed/);
      assert.equal(requests.filter((request) => request.method === "PATCH").length, 0);
    }
  );
});

test("fails instead of falsely reporting success when a conditional update matches no row", async () => {
  await withFakeSupabase(
    (request, response) => {
      if (request.method === "GET") {
        const scheduled = request.url.searchParams.get("status") === "eq.scheduled";
        return json(
          response,
          200,
          scheduled
            ? [{ id: "one", slug: "raced-post", publish_at: "2020-01-01T00:00:00Z", categories: null }]
            : []
        );
      }
      if (request.method === "PATCH") return json(response, 200, []);
      return json(response, 404, {});
    },
    async (baseUrl) => {
      const result = await runPublisher(baseUrl);
      assert.equal(result.code, 1);
      assert.match(result.stderr, /conditional update matched no row/);
    }
  );
});
