# Google Workspace Opener for Obsidian

[![GitHub Release](https://img.shields.io/github/v/release/lazytarget/obsidian-google-workspace-opener?style=flat-square)](https://github.com/lazytarget/obsidian-google-workspace-opener/releases/latest)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?style=flat-square&logo=obsidian&color=7c3aed&label=downloads&query=%24%5B%22google-workspace-opener%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=google-workspace-opener)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Seamlessly open `.gdoc`, `.gsheet`, `.gform`, `.gslides`, and `.gdraw` files from your Obsidian vault directly in your browser. If you keep your Google Drive folder inside your vault, this plugin intercepts clicks on those Google Workspace shortcut files and routes them to the correct Google Workspace URL — instead of showing a confusing error in Obsidian.

---

## How it works

Google Drive Desktop stores `.gdoc`, `.gsheet`, `.gform`, `.gslides`, and `.gdraw` files as small stubs on your filesystem. The plugin handles both modes that Google Drive Desktop can operate in:

| Google Drive mode | Stub type | Strategy used |
|---|---|---|
| **Mirror** (files downloaded locally) | JSON file containing a `url` field | Reads the URL directly and opens it in the browser |
| **Stream** (cloud-only stubs) | OS-level directory stub (`EISDIR`) | Hands the path to the OS shell, which lets Google Drive Desktop resolve and open the file |

Both strategies silently close the Obsidian leaf after routing so there is no leftover blank tab.

---

## Requirements

- **Obsidian** v0.15.0 or later (desktop)
- **Google Drive Desktop** installed and running
- Your Google Drive folder (or a subfolder of it) added to your Obsidian vault

---

## Installation

### Community plugins (recommended)

1. Open **Settings → Community plugins** and disable Safe mode if prompted.
2. Click **Browse** and search for **Google Workspace Opener**.
3. Click **Install**, then **Enable**.

### Manual installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/lazytarget/obsidian-google-workspace-opener/releases/latest).
2. Copy the three files into `<your vault>/.obsidian/plugins/google-workspace-opener/`.
3. Reload Obsidian and enable the plugin under **Settings → Community plugins**.

---

## Development

Requirements: Node.js ≥ 18.18

```bash
git clone https://github.com/lazytarget/obsidian-google-workspace-opener.git
cd obsidian-google-workspace-opener
npm install
npm run dev   # watch mode — outputs main.js
```

Copy the output files into your vault's plugin folder (or symlink the repo there directly) and reload Obsidian to test changes.

To do a production build with type-checking:

```bash
npm run build
```

### Releasing a new version

1. Update `minAppVersion` in `manifest.json` if needed.
2. Run `npm version patch` (or `minor` / `major`) — this bumps `manifest.json`, `package.json`, and `versions.json` automatically.
3. Create a GitHub release using the new version number as the tag (no `v` prefix).
4. Attach `main.js` and `manifest.json` as release assets.

---

## License

[MIT](LICENSE) © [lazytarget](https://github.com/lazytarget/)
