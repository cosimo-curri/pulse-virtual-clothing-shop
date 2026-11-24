import AdminControlPanel from "./AdminControlPanel";
import UserControlPanel from "./UserControlPanel";

import helpers from "../helpers";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

import { fetch_API } from "../fetch_API";

function ControlPanel() {
    const navigate = useNavigate();

    const [loggedUser, setLoggedUser] = useState(JSON.parse(localStorage.getItem("loggedUser")));
    
    const handleLogout = () => {
        toast("Loading...", toast_JSON.wait);

        fetch(fetch_API.logout, {
            headers: new Headers({
                token: loggedUser.currentValidToken
            })
        })
        .then(res => {
            if(res.ok)
                return res.json();
            else
                toast("An error occurred", toast_JSON.error);
        })
        .then(obj => {
            if(obj.message === "LOGOUT_OK")
                toast("Goodbye", toast_JSON.success);

            localStorage.removeItem("loggedUser");
            setLoggedUser(null);

            navigate("/");
        });
    }

    const handleManageClothings = () => {
        navigate("/manageClothings");
    }

    const handleHumanAcquisition = () => {
        navigate("/humanAcquisition");
    }

    const handleVirtualAssistant = () => {
        navigate("/virtualAssistant");
    }

    useEffect(() => {
        helpers.checkComponent();

        if(!loggedUser)
            navigate("/");
    }, [loggedUser, navigate]);

    return (
        <>
            {
                loggedUser &&
                (
                    loggedUser.role === "admin" ?
                    (
                        <AdminControlPanel loggedUser={ loggedUser } handleLogout={ handleLogout } />
                    )
                    :
                    (
                        <UserControlPanel
                            loggedUser={ loggedUser }
                            handleManageClothings={ handleManageClothings }
                            handleHumanAcquisition={ handleHumanAcquisition }
                            handleVirtualAssistant={ handleVirtualAssistant }
                            handleLogout={ handleLogout }
                        />
                    )
                )
            }
        </>
    );
}

export default ControlPanel;