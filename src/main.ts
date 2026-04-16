import { Plugin, FileView, WorkspaceLeaf, TFile } from 'obsidian';

const VIEW_TYPE_GOOGLE_WORKSPACE = "google-workspace-view";

// 1. Create the Custom View
class GoogleWorkspaceView extends FileView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_GOOGLE_WORKSPACE;
    }

    getDisplayText() {
        return "Routing to Google Workspace...";
    }

    // This lifecycle method runs as soon as Obsidian tries to load the file into the view
    async onLoadFile(file: TFile) {
        console.log(`[GoogleWorkspace] onLoadFile called for: ${file.path}`);

        // Strategy A: try reading the file as a local JSON stub.
        // Google Drive Desktop in "mirror" mode stores .gdoc/.gsheet files as small
        // JSON files: { "url": "https://docs.google.com/...", "doc_id": "...", ... }
        try {
            const content = await this.app.vault.read(file);
            console.log(`[GoogleWorkspace] file content (first 200 chars): ${content.slice(0, 200)}`);

            const payload = JSON.parse(content);
            console.log(`[GoogleWorkspace] parsed payload:`, payload);
            const url = payload.url;

            if (url) {
                console.log(`[GoogleWorkspace] opening URL via window.open: ${url}`);
                window.open(url);
                setTimeout(() => this.leaf.detach(), 0);
                return;
            }
            console.warn("[GoogleWorkspace] No 'url' field found in payload:", payload);
        } catch (e) {
            // Strategy A failed — most likely because Google Drive Desktop is running in
            // "stream" mode: the .gdoc file is a cloud-only stub that the OS filesystem
            // reports as a directory (EISDIR).  Fall through to Strategy B.
            console.warn("[GoogleWorkspace] vault.read() failed (likely a stream-mode stub):", (e as Error).message);
        }

        // Strategy B: hand the file back to the OS shell.
        // Google Drive Desktop registers the .gdoc/.gsheet file associations at the OS level
        // and will intercept shell.openPath(), resolve the stub, and open the browser.
        await this.openViaShell(file);
        setTimeout(() => this.leaf.detach(), 0);
    }

    private async openViaShell(file: TFile) {
        // getBasePath() is only available on the desktop FileSystemAdapter
        const basePath = (this.app.vault.adapter as any).getBasePath?.();
        if (!basePath) {
            console.error("[GoogleWorkspace] Could not resolve vault base path — is this a mobile vault?");
            return;
        }
        const fullPath = require('path').join(basePath, file.path);
        console.log(`[GoogleWorkspace] opening via shell.openPath: ${fullPath}`);

        const { shell } = require('electron');
        const error = await shell.openPath(fullPath);
        if (error) {
            console.error(`[GoogleWorkspace] shell.openPath failed: ${error}`);
        }
    }
}

export default class GoogleWorkspacePlugin extends Plugin {
    async onload() {
        // Register the custom view with Obsidian
        this.registerView(
            VIEW_TYPE_GOOGLE_WORKSPACE,
            (leaf) => new GoogleWorkspaceView(leaf)
        );

        // Override the default behavior for these specific extensions
        this.registerExtensions(['gdoc', 'gsheet'], VIEW_TYPE_GOOGLE_WORKSPACE);
    }

    onunload() {
        // Cleanup logic goes here if needed, but registering views/extensions 
        // is generally handled by Obsidian upon unload.
    }
}
