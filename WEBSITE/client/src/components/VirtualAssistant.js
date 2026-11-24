import "../styles/VirtualAssistant.css";

import helpers from "../helpers";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./Experience";
import { UI } from "./UI";

import { ChatProvider } from "../hooks/useChat";

function VirtualAssistant() {
    const navigate = useNavigate();

    const [loggedUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("loggedUser")); }
        catch (_) { return null; }
    });

    useEffect(() => {
        helpers.checkComponent();

        if(!loggedUser)
            navigate("/");
    }, [loggedUser, navigate]);

    return (
        <div className="VirtualAssistantContainer">
            <ChatProvider>
                <Leva collapsed />

                <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                    <Experience />
                </Canvas>

                <UI />
            </ChatProvider>

            <Link to="/panel">CONTROL PANEL</Link>
        </div>
    );
}

export default VirtualAssistant;