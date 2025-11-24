# iphey — Digital Identity & Fingerprint Inspector

iphey is a TypeScript-first Express API paired with a Next.js 14 client that benchmarks how “real” a browser session looks. It combines IP intelligence (ipinfo + Cloudflare Radar) with local fingerprint telemetry and renders an interactive dashboard inspired by the reference UI you shared.

## Stack
- **API**: Express 5, TypeScript, Zod, Pino, LRU cache, undici
- **Clients**: ipinfo batch + Cloudflare Radar with automatic failover and per-IP caching
- **Scoring**: deterministic heuristics for browser/location/IP/hardware/software panels
- **Frontend**: Next.js 14 + App Router (see `apps/web-next`), React Query for live scans, deployed to Cloudflare Pages
- **Tooling**: ts-node-dev for local dev, Vitest + Supertest for unit coverage, npm scripts mirror AGENTS.md guidelines

## Project Layout
```
├─ src/                 # Express app, routes, clients, middleware
├─ apps/web-next/       # Next.js 14 front-end (production)
├─ docs/                # Specs & configuration notes
├─ dist/                # Compiled server + bundled frontend (via `npm run build`)
└─ .env.example         # Required environment variables (no secrets committed)

Note: The mixvisit/ directory (if present) is an external Svelte library, NOT part of IPhey.
It's gitignored and not integrated into the build process.
```

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   bash -lc "cd apps/web-next && npm install"
   ```
2. **Configure environment**
   - Copy `.env.example` → `.env` and fill at least `IPINFO_TOKEN` **or** both `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_RADAR_TOKEN`.
   - Do **not** commit real tokens. Keep them in 1Password/local vaults per security guidance.
3. **Run the stack**
  ```bash
  # start API (port 4310)
  npm run dev

   # optional: run the Next.js dev server with hot reload (port 3002 proxying /api)
   npm run web:dev
  ```
  The Next.js client already lives in `apps/web-next`. During local work it runs independently on port 3002 and proxies `/api` calls back to the Express server. Production traffic is served through Cloudflare Pages.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | ts-node-dev hot reload of the API |
| `npm run web:dev` | Next.js App Router dev server on port 3002 |
| `npm run build` | Builds the Next.js client (`apps/web-next`) then compiles the API/Worker via `tsc` |
| `npm start` | Runs the compiled API from `dist/` |
| `npm run lint` / `npm run web:lint` | Type-check API / frontend |
| `npm run test` | Vitest suite (mocks ipinfo/radar clients) |
| `npm run coverage` | Vitest with V8 coverage reports |

## API Surface
| Method | Route | Description |
| --- | --- | --- |
| `GET /api/health` | Build metadata + upstream readiness (ipinfo token presence, Radar verification) |
| `GET /api/v1/ip/:ip?` | Normalized IP intelligence (cached, uses fallback) |
| `POST /api/v1/report` | Accepts browser fingerprint payloads (see `src/schemas/report.ts`) and returns panel scores + verdict |

All payloads are validated via Zod and errors bubble up through a typed ApiError helper.

## 生产部署步骤 (Production Deployment)

镜像 `creepjs` 项目中的 `DIRECT_DEPLOY.md` / `.deploy.env` 做法，这里同样把 API 与前端都发布到 Cloudflare（Workers + Pages）。关键步骤：

1. **准备凭据**
   - 复制 `.deploy.env.example` 为 `.deploy.env`，并把 `/Volumes/SSD/dev/new/2fa/.deploy.env` 中的真实值填入对应变量（Cloudflare Account/API token、KV、NEXT_PUBLIC_API_URL 等）。
   - `wrangler secret put` 写入 `IPINFO_TOKEN`、`CLOUDFLARE_RADAR_TOKEN` 等机密，确保 `wrangler.toml` 里的 KV `binding` 与生产 Namespace 对齐。
2. **构建前端 (Cloudflare Pages)**
   - 运行 `npm run web:build`（内部即 `npm run build --prefix apps/web-next`）。
   - 使用 Next on Pages 产出的 `.vercel/output/static` 执行：
     ```bash
     CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID \
     CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN \
     npx wrangler pages deploy .vercel/output/static \
       --project-name="$CLOUDFLARE_PAGES_PROJECT"
     ```
3. **构建 / 部署 API (Cloudflare Workers)**
   - `npm run build:worker` 会串行执行 Next.js build + `tsc`，生成 `dist/worker.js`。
   - `wrangler deploy --name "$CLOUDFLARE_WORKER_NAME" --env production` 推送到 Workers，绑定 KV + 环境变量。
4. **验收**
   - `curl "$PRODUCTION_API_URL/api/health"`、`curl -I "$PRODUCTION_WEB_URL"`。
   - Cloudflare Radar / ipinfo token 的有效性会写在 `/api/health` 响应里，方便对照。

更细粒度的操作（KV 初始化、Pages Diff、GitHub Release）请查看 `docs/DIRECT_DEPLOY.md`，它与 `/Volumes/SSD/dev/new/ip-dataset/creepjs/DIRECT_DEPLOY.md` 保持同构，方便在两个仓库间复制命令。

If you prefer container-based hosting for the Express server, run `npm run build` and deploy `dist/server.js` to your platform of choice, then point the front-end’s `NEXT_PUBLIC_API_URL` to that hostname.

## API 示例 (API Examples)

```bash
# Health check & upstream readiness
curl https://api.example.com/api/health

# Single IP lookup
curl https://api.example.com/api/v1/ip/8.8.8.8 | jq

# Enhanced IP + threat intel + ASN data
curl "https://api.example.com/api/v1/ip/1.1.1.1/enhanced?threats=true&asn=true" | jq '.risk_assessment'

# Fingerprint report (trimmed sample payload)
curl -X POST https://api.example.com/api/v1/report \
  -H 'Content-Type: application/json' \
  -d '{
        "fingerprint": {
          "userAgent": "Mozilla/5.0 ...",
          "languages": ["en-US","en"],
          "screen": {"width":1920,"height":1080},
          "hardwareConcurrency": 8,
          "cookiesEnabled": true
        }
      }'

# Threat intel only
curl https://api.example.com/api/v1/ip/8.8.8.8/threats | jq '.combined'
```

所有请求/响应都经过 Zod 校验并由统一的 `ApiError` 抛出，所以 curl 示例里的返回值可以直接复制到 CI 或外部监控脚本。

## Frontend UX
- Landing verdict hero with animated score dial and trust badge
- Five parity cards (Browser/Location/IP/Hardware/Software) linking to detailed signals
- Live “What websites see about you” grid reflecting the captured fingerprint
- CTA to the extended leak check + sponsor slot to mirror the reference design

The Next.js SPA uses React Query to run `collectFingerprint()` (WebGL, canvas, audio, fonts, timezone, etc.), sends it to `/api/v1/report`, and renders the normalized response.

## Testing & QA
- `vitest` covers scoring logic (`reportService`) and IP client failover paths (`ipService`).
- When adding new routers or clients, include fixtures under `src/**/__tests__` with mock resolvers so CI keeps the 80% target.
- Manual QA: `curl http://localhost:4310/api/health`, `curl -XPOST http://localhost:4310/api/v1/report -d '{"fingerprint":{...}}'`, plus visiting the Next.js dev server on http://localhost:3002.

## 故障排查 (Troubleshooting)

- **IP shows `::1` locally / IP 总是 ::1**：本地 Express 未开启反代，Cloudflare 头部不可用。部署到 Workers 或设置 `TRUST_PROXY=loopback` 并在调试请求里附带 `X-Forwarded-For`。
- **`Invalid environment configuration` on boot / 启动即配置错误**：`.env` 至少需要 `IPINFO_TOKEN` 或 `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_RADAR_TOKEN`。缺失时 `src/config.ts` 会抛出 Zod 错误。
- **`CLOUDFLARE_API_TOKEN required` 部署失败**：确保在执行任何 `wrangler` 命令前 `source .deploy.env`，token 需要 Workers KV + Pages 权限（与 creepjs 相同）。
- **`429` from upstream providers / 频繁 429**：关闭或延长 `CACHE_WARMING_*`，SWR 缓存会在后台刷新。
- **Frontend can’t reach API / Web 无法访问 API**：确认 Pages 环境变量 `NEXT_PUBLIC_API_URL` 指向 Workers 域名，并在 `CORS_ALLOWED_ORIGINS` 添加 Pages 域。
- **Pages 构建成功但白屏**：检查 `.vercel/output/static` 是否由 Next on Pages 生成；必要时运行 `npx @cloudflare/next-on-pages` 再 `wrangler pages deploy`，此流程与 creepjs/Web 一致。

## Security Notes
- Secrets must stay out of git; use `.deploy.env`, `wrangler secret`, or your CI’s secret store.
- Logs redact IPs before emitting and the service never persists raw fingerprints.
- Rate limiting (60 req/min) is enabled per spec.

For deeper roadmap items, see `docs/PROJECT_SPEC.md`. Contributions should follow Conventional Commits and request review from the IP platform team.
