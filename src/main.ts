import { Plugin, FileSystemAdapter, FileView, WorkspaceLeaf, TFile, Notice } from 'obsidian';

const VIEW_TYPE_GOOGLE_WORKSPACE = "google-workspace-view";

function extractGoogleWorkspaceUrl(content: string): string | null {
    let parsed: unknown;

    try {
        parsed = JSON.parse(content);
    } catch {
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }

    const { url } = parsed as { url?: unknown };
    return typeof url === 'string' ? url : null;
}

type ElectronShellModule = {
    shell: {
        openPath: (fullPath: string) => Promise<string>;
    };
};

function isElectronShellModule(value: unknown): value is ElectronShellModule {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const module = value as { shell?: { openPath?: unknown } };
    return typeof module.shell?.openPath === 'function';
}

// 1. Create the Custom View
class GoogleWorkspaceView extends FileView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_GOOGLE_WORKSPACE;
    }

    getDisplayText() {
        return "Route to google workspace...";
    }

    // This lifecycle method runs as soon as Obsidian tries to load the file into the view
    async onLoadFile(file: TFile) {
        let opened = false;

        try {
            const content = await this.app.vault.read(file);
            const url = extractGoogleWorkspaceUrl(content);

            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
                opened = true;
            }
        } catch {
            // Fall through to shell fallback for stream-mode stubs.
        }

        if (!opened) {
            opened = await this.openViaShell(file);
        }

        if (!opened) {
            new Notice('Could not open this google workspace file.');
        }

        this.leaf.detach();
    }

    private async openViaShell(file: TFile): Promise<boolean> {
        const { adapter } = this.app.vault;
        if (!(adapter instanceof FileSystemAdapter)) {
            return false;
        }

        const fullPath = `${adapter.getBasePath()}/${file.path}`;

        const maybeRequire = (window as Window & {
            require?: (moduleName: string) => unknown;
        }).require;
        if (!maybeRequire) {
            return false;
        }

        const electronModule = maybeRequire('electron');
        if (!isElectronShellModule(electronModule)) {
            return false;
        }

        const error = await electronModule.shell.openPath(fullPath);
        return error.length === 0;
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
