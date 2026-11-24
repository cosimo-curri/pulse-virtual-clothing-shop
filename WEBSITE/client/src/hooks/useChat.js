import { createContext, useCallback, useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";
import { fetch_API } from "../fetch_API";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [loggedUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("loggedUser")); }
        catch (_) { return null; }
    });
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cameraZoomed, setCameraZoomed] = useState(true);

    const chat = useCallback(async (userPrompt) => {
        if (typeof userPrompt !== "string" || !userPrompt.trim() || !loggedUser?.currentValidToken) {
            toast("Enter a message while signed in.", toast_JSON.error);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(fetch_API.virtualAssistant, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: loggedUser.currentValidToken
                },
                body: JSON.stringify({ userPrompt: userPrompt.trim() })
            });
            if (!response.ok) throw new Error(`Assistant request failed (${response.status})`);
            const payload = await response.json();
            if (payload.message !== "AI_RESPONSE_OK" || !Array.isArray(payload.messages)) {
                throw new Error("The assistant could not produce a response");
            }
            setMessages((current) => [...current, ...payload.messages]);
        } catch (_) {
            toast("The virtual assistant is unavailable. Please try again.", toast_JSON.error);
        } finally {
            setLoading(false);
        }
    }, [loggedUser]);

    const onMessagePlayed = useCallback(() => {
        setMessages((current) => current.slice(1));
    }, []);

    useEffect(() => {
        setMessage(messages.length ? messages[0] : null);
    }, [messages]);

    return (
        <ChatContext.Provider value={{
            chat, message, onMessagePlayed, loading, cameraZoomed, setCameraZoomed
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};
