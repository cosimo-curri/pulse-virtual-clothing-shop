import "../styles/AdminControlPanel.css";

import helpers from "../helpers";

import SearchResult from "./SearchResult";

import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

import { fetch_API } from "../fetch_API";

function AdminControlPanel(props) {
    const [findUser, setFindUser] = useState(null);

    const handleChangeSearch = (event) => {
        const value = event.target.value;

        if(value !== "") {
            fetch(fetch_API.findUser + "/" + event.target.value, {
                headers: new Headers({
                    token: props.loggedUser.currentValidToken
                })
            })
            .then(res => {
                if(res.ok)
                    return res.json();
                else
                    toast("An error occurred", toast_JSON.error);
            })
            .then(obj => {
                setFindUser(obj);
            });
        } else
            setFindUser(null);
    }

    const handleDeleteUser = (event) => {
        const email = event.target.innerText;

        toast("Loading...", toast_JSON.wait);
        
        fetch(fetch_API.deleteUser, {
            method: "DELETE",
            headers: new Headers({
                "Content-Type": "application/json",
                token: props.loggedUser.currentValidToken
            }),
            body: JSON.stringify({
                email: email
            })
        })
        .then(res => {
            if(res.ok)
                return res.json();
            else
                toast("An error occurred", toast_JSON.error);
        })
        .then(obj => {
            switch(obj.message) {
                case "TOKEN_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN":
                case "USER_NOT_LOGGED":
                case "ONLY_ADMIN_API":
                case "DELETE_USER_ERROR":
                    toast("An error occurred", toast_JSON.error);
                    break;

                case "DELETE_USER_OK":
                    toast("User successfully deleted", toast_JSON.success);

                    document.getElementById("input-search").value = "";

                    const newFindUser = findUser.filter((element) => element.email !== email);
                    setFindUser(newFindUser);

                    break;

                default: break;
            }
        });
    }

    const handleOnlyNumber = (event) => {
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
    }

    const handleCreateShop = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        toast("Loading...", toast_JSON.wait);
        
        fetch(fetch_API.createShop, {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                token: props.loggedUser.currentValidToken
            }),
            body: JSON.stringify({
                VAT: formData.get("VAT"),
                name: formData.get("name"),
                address: {
                    street: formData.get("street"),
                    civic: formData.get("civic"),
                    ZIP: formData.get("ZIP")
                },
                adminEmail: formData.get("adminEmail")
            })
        })
        .then(res => {
            if(res.ok)
                return res.json();
            else
                toast("An error occurred", toast_JSON.error);
        })
        .then(obj => {
            switch(obj.message) {
                case "TOKEN_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN":
                case "USER_NOT_LOGGED":
                case "ONLY_ADMIN_API":
                case "FIND_USER_ERROR":
                case "CREATE_SHOP_ERROR":
                    toast("An error occurred", toast_JSON.error);
                    break;

                case "USER_ALREADY_SHOP":
                    toast("The user is already associated with a shop", toast_JSON.error);
                    break;

                case "CREATE_SHOP_OK":
                    toast("Shop successfully created", toast_JSON.success);
                    break;

                default: break;
            }

            event.target.reset();
        });
    }

    useEffect(() => {
        helpers.checkComponent();
        document.getElementsByClassName("SearchResultContainer")[0].style.width = (document.getElementById("input-search").clientWidth - 20)+ "px";
    }, []);

    return (
        <div className="AdminControlPanelContainer">
            <div id="page-content">
                <div id="grid-container">
                    <div className="grid-item">
                        <form onSubmit={ handleCreateShop }>
                            <p>Shops registration</p>

                            <label htmlFor="VAT">VAT number</label>
                            <input type="text" name="VAT" id="VAT" placeholder="IT12345678901" maxLength={ 11 } required />

                            <label htmlFor="name">Name</label>
                            <input type="text" name="name" id="name" placeholder="Virtual Clothing Shop" required />

                            <label htmlFor="street">Street</label>
                            <input type="text" name="street" id="street" placeholder="Via Taranto" required />

                            <label htmlFor="civic">Civic number</label>
                            <input type="text" name="civic" id="civic" placeholder="78A" required />

                            <label htmlFor="ZIP">ZIP code</label>
                            <input type="text" name="ZIP" id="ZIP" placeholder="74121" onChange={ handleOnlyNumber } required />

                            <label htmlFor="adminEmail">Shop owner e-mail</label>
                            <input type="text" name="adminEmail" id="adminEmail" placeholder="name@example.com" required />

                            <button id="buttonRegister">Register</button>
                        </form>
                    </div>

                    <div className="grid-item">
                        <div id="div-column">
                            <p id="p-column">Delete users w/shops</p>
                            <input type="text" id="input-search" placeholder="name@example.com" onChange={ handleChangeSearch } />
                            <SearchResult findUser={ findUser } handleDeleteUser={ handleDeleteUser } />
                        </div>
                    </div>

                    <div id="logout-grid-item" className="grid-item" onClick={ props.handleLogout }>
                        <img src="./images/logout.jpg" alt="Logout" />
                        <p>Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminControlPanel;