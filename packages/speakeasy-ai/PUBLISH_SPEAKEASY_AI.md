# Publish Checklist — `speakeasy-ai`

## 0) Preflight

```bash
cd packages/speakeasy-ai
node -v
npm -v
npm whoami
```

- Ensure `npm whoami` returns the intended publisher account.

## 1) Validate package locally

```bash
cd /Users/clawd/Desktop/Wren/projects/0xclaw/repo
npm --workspace packages/speakeasy-ai test
cd packages/speakeasy-ai
npm pack --dry-run
```

Expected tarball contents:
- `README.md`
- `package.json`
- `src/index.mjs`

## 2) Version bump

Choose one:

```bash
# patch
npm version patch

# or minor
npm version minor

# or explicit
npm version 0.1.1
```

## 3) Publish to npm

```bash
npm publish --access public
```

If publish requires OTP:

```bash
npm publish --access public --otp <code>
```

## 4) Post-publish verification

```bash
npm view speakeasy-ai version
npm view speakeasy-ai dist-tags
npm view speakeasy-ai --json | head -n 40
```

## 5) Smoke test in clean temp project

```bash
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"
npm init -y
npm i speakeasy-ai
node -e "import('speakeasy-ai').then(m=>console.log(Object.keys(m)))"
```

Expected export includes:
- `SpeakeasyClient`

## 6) Runtime smoke snippet

```js
import { SpeakeasyClient } from 'speakeasy-ai';

const client = new SpeakeasyClient({
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  // defaults to https://speakeasy.ing
});

const response = await client.chat.completions.create({
  model: 'deepseek-v3.2',
  messages: [{ role: 'user', content: 'Analyze this token...' }],
  stream: true,
});

for await (const chunk of response) {
  console.log(chunk);
}
```

## 7) Release note template

- package: `speakeasy-ai@<version>`
- highlights:
  - OpenAI-compatible `chat.completions.create`
  - built-in x402 flow (402 parse → sign → replay)
  - streaming async iterator support
  - default base URL: `https://speakeasy.ing`
