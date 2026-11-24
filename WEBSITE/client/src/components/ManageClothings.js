import "../styles/ManageClothings.css";

import helpers from "../helpers";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";
import { fetch_API } from "../fetch_API";
import UpdateClothingForm from "../components/UpdateClothingForm";

function getLoggedUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedUser"));
    } catch (_) {
        return null;
    }
}

async function requestJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const result = await response.json();
    if (!result || typeof result.message !== "string") throw new Error("Invalid server response");
    return result;
}

function ManageClothings() {
    const navigate = useNavigate();
    const [loggedUser] = useState(getLoggedUser);
    const [clothings, setClothings] = useState([]);
    const [fetchFinished, setFetchFinished] = useState(false);
    const [clothingUpdate, setClothingUpdate] = useState(null);

    useEffect(() => {
        if (!loggedUser?.shop) return;
        const ws = new WebSocket(fetch_API.SOCKET_URL);

        ws.onmessage = (event) => {
            try {
                const newClothing = JSON.parse(event.data);
                if (String(newClothing.shopId) === String(loggedUser.shop)) {
                    setClothings(current => current.some(item => item._id === newClothing._id)
                        ? current : [...current, newClothing]);
                    toast("A new clothing has been registered", toast_JSON.success);
                }
            } catch (_) {
                // Discard malformed events without breaking the clothing page.
            }
        };

        return () => ws.close();
    }, [loggedUser]);

    useEffect(() => {
        helpers.checkComponent();
        if (!loggedUser) {
            navigate("/");
            return;
        }
        if (!loggedUser.shop) return;

        const controller = new AbortController();
        const loadClothings = async () => {
            toast("Loading...", toast_JSON.wait);
            try {
                const result = await requestJson(
                    fetch_API.getAllClothingsByShopId + "/" + loggedUser.shop,
                    {
                        headers: new Headers({ token: loggedUser.currentValidToken }),
                        signal: controller.signal
                    }
                );
                if (controller.signal.aborted) return;
                if (result.message === "GET_CLOTHINGS_OK" && Array.isArray(result.clothings)) {
                    setClothings(result.clothings);
                    toast("All clothings successfully obtained", toast_JSON.success);
                } else {
                    toast("An error occurred", toast_JSON.error);
                }
            } catch (_) {
                if (!controller.signal.aborted) toast("An error occurred", toast_JSON.error);
            } finally {
                if (!controller.signal.aborted) setFetchFinished(true);
            }
        };

        loadClothings();
        return () => controller.abort();
    }, [loggedUser, navigate]);

    const handleDeleteClothing = async (clothingId) => {
        if (!loggedUser) return;
        toast("Loading...", toast_JSON.wait);
        try {
            const result = await requestJson(fetch_API.deleteClothing, {
                method: "DELETE",
                headers: new Headers({
                    "Content-Type": "application/json",
                    token: loggedUser.currentValidToken
                }),
                body: JSON.stringify({ clothingId })
            });
            if (result.message !== "DELETE_CLOTHING_OK") {
                toast("An error occurred", toast_JSON.error);
                return;
            }
            setClothings(current => current.filter(element => element._id !== clothingId));
            toast("Clothing successfully deleted", toast_JSON.success);
        } catch (_) {
            toast("An error occurred", toast_JSON.error);
        }
    };

    const handleUpdateClothingVisible = (clothingId) => {
        setClothingUpdate(current => current === clothingId ? null : clothingId);
    };

    const handleUpdateClothing = async (event) => {
        event.preventDefault();
        if (!loggedUser) return;
        const formData = new FormData(event.currentTarget);
        toast("Loading...", toast_JSON.wait);

        try {
            const result = await requestJson(fetch_API.updateClothing, {
                method: "PUT",
                headers: new Headers({
                    "Content-Type": "application/json",
                    token: loggedUser.currentValidToken
                }),
                body: JSON.stringify({
                    clothingId: formData.get("clothingId"),
                    price: formData.get("price"),
                    gender: formData.get("gender"),
                    type: formData.get("type"),
                    material: formData.get("material"),
                    quantity: formData.get("quantity"),
                    size: formData.get("size"),
                    length: formData.get("length"),
                    width: formData.get("width"),
                    neckWidth: formData.get("neckWidth"),
                    sleeveWidth: formData.get("sleeveWidth")
                })
            });

            if (result.message !== "UPDATE_CLOTHING_OK" || !result.clothingUpdated) {
                toast("An error occurred", toast_JSON.error);
                return;
            }
            setClothingUpdate(null);
            setClothings(current => current.map(clothing =>
                clothing._id === result.clothingUpdated._id ? result.clothingUpdated : clothing
            ));
            toast("Clothing successfully updated", toast_JSON.success);
            document.getElementById(formData.get("clothingId"))?.scrollIntoView({
                behavior: "smooth"
            });
        } catch (_) {
            toast("An error occurred", toast_JSON.error);
        }
    };

    if (!loggedUser) return null;

    return (
        <div className="ManageClothingsContainer">
            {
                loggedUser.shop
                ?
                <div id="clothing-container">
                    {
                        clothings.map(element => (
                            <div className="clothing" id={ element._id } key={ element._id }>
                                <div className="info-container">
                                    <h3>{ element.type + " (" + element.material + ")" }</h3>
                                    <div className="buttons-container">
                                        <h1 onClick={ () => handleDeleteClothing(element._id) }>❌</h1>
                                        <h1 onClick={ () => handleUpdateClothingVisible(element._id) }>✏️</h1>
                                    </div>
                                </div>

                                <img src={ element.texturePath } alt="Texture" />

                                <ul>
                                    <li><u>Price</u>: { element.price } €</li>
                                    <li><u>Quantity</u>: { element.quantity } pcs</li>
                                    <li><u>Gender</u>: { element.gender }</li>
                                    <li><u>Size</u>: { element.size }</li>
                                    <li><u>Length</u>: {element.dimensions.length } cm | <u>Width</u>: { element.dimensions.width } cm | <u>Neck width</u>: { element.dimensions.neckWidth } cm | <u>Sleeve width</u>: { element.dimensions.sleeveWidth } cm</li>
                                </ul>

                                {
                                    clothingUpdate
                                    &&
                                    clothingUpdate === element._id
                                    &&
                                    <UpdateClothingForm handleUpdateClothing={ handleUpdateClothing } clothing={ element } />
                                }
                            </div>
                        ))
                    }

                    {
                        fetchFinished
                        &&
                        clothings.length === 0
                        &&
                        <p className="central-message">Your shop is empty.</p>
                    }
                </div>
                :
                <p className="central-message">You don't have a shop associated.</p>
            }

            <Link to="/panel">CONTROL PANEL</Link>
        </div>
    );
}

export default ManageClothings;