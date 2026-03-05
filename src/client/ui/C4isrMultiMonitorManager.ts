export class C4isrMultiMonitorManager {
    private static popupWindows: Map<string, Window | null> = new Map();

    /**
     * Allows the player to "pop out" UI elements into separate browser windows.
     * Perfect for multi-monitor setups where one screen is the 3D map, 
     * and the other is pure OSINT data streams and economy graphs.
     */
    public static openDetachedPanel(panelId: string, urlPath: string) {
        if (this.popupWindows.has(panelId)) {
            const existingWindow = this.popupWindows.get(panelId);
            if (existingWindow && !existingWindow.closed) {
                existingWindow.focus();
                return;
            }
        }

        // Open a new, chrome-less window
        const features = "menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=800,height=600";
        const newWindow = window.open(urlPath, panelId, features);
        
        this.popupWindows.set(panelId, newWindow);
    }

    /**
     * Broadcasts state updates via the Browser's native BroadcastChannel API,
     * allowing the main game window to instantly sync data to the popup windows
     * without hitting the Node.js server.
     */
    public static syncStateToPopups(channelName: string, data: any) {
        const bc = new BroadcastChannel(channelName);
        bc.postMessage(data);
        bc.close();
    }
}