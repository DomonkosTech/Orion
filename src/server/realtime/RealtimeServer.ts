import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { supabase } from "../../lib/supabaseClient.ts";

export const setupRealtime = (server: Server) => {
    // Initialize WebSocket Server
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("New WebSocket connection");

        ws.on("message", (message) => {
            console.log("Received:", message);
        });

        ws.on("close", () => {
            console.log("WebSocket disconnected");
        });
    });

    // Subscribe to Supabase changes
    supabase
        .channel('messages')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                console.log('New message received from Supabase:', payload);
                // Broadcast to all connected WebSocket clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'NEW_MESSAGE',
                            payload: payload.new
                        }));
                    }
                });
            }
        )
        .subscribe((status, error) => {
            console.log("Supabase subscription status:", status);
            if (error) {
                console.error("Supabase subscription error:", error);
            }
        });
};