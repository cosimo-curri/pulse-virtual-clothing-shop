import "../styles/SignUp.css";

import helpers from "../helpers";

import { useState, useEffect } from "react";

import { useNavigate, Link } from "react-router-dom";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

import { fetch_API } from "../fetch_API";

function SignUp() {
    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const handleShow = () => {
        setShow(!show);
    }

    const handleShowConfirm = () => {
        setShowConfirm(!showConfirm);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (formData.get("password") !== formData.get("password_confirm")) {
            toast("The passwords don't match", toast_JSON.error);
            return;
        }

        toast("Loading...", toast_JSON.wait);
        try {
            const response = await fetch(fetch_API.signup, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json" }),
                body: JSON.stringify({
                    email: formData.get("email"),
                    firstName: formData.get("first_name"),
                    lastName: formData.get("second_name"),
                    password: formData.get("password")
                })
            });
            if (!response.ok) throw new Error(`Request failed (${response.status})`);
            const result = await response.json();

            switch (result?.message) {
                case "NOT_AN_EMAIL":
                    toast("The e-mail format isn't valid", toast_JSON.error);
                    break;
                case "WEAK_PASSWORD":
                    toast("The password is too weak.\n\nIt must contain at least:\n➡️ 8 characters\n➡️ 1 uppercase letter\n➡️ 1 lowercase letter\n➡️ 1 number\n➡️ 1 special character", toast_JSON.error);
                    break;
                case "UserExistsError":
                    toast("The e-mail is already in use", toast_JSON.error);
                    break;
                case "EMAIL_SEND_OK":
                    toast("Check your e-mail", toast_JSON.email);
                    navigate("/signin");
                    break;
                default:
                    toast("An error occurred", toast_JSON.error);
            }
        } catch (_) {
            toast("An error occurred", toast_JSON.error);
        }
    };

    useEffect(() => {
        helpers.checkComponent();
    }, []);

    return (
        <div className="SignUpContainer">
            <div>
                <h3>Welcome!</h3>
                <p>Create an account.</p>

                <form onSubmit={ handleSubmit }>
                    <label htmlFor="email">E-mail</label>
                    <input type="email" name="email" id="email" placeholder="name@example.com" required />

                    <label htmlFor="first_name">First name</label>
                    <input type="text" name="first_name" id="first_name" placeholder="Cosimo" required />

                    <label htmlFor="second_name">Second name</label>
                    <input type="text" name="second_name" id="second_name" placeholder="Curri" required />

                    <label htmlFor="password">Password</label>
                    <div className="password-container">
                        <input type={ show ? "text" : "password" } name="password" id="password" placeholder="••••••••••••••••••••" required />
                        <span onClick={ handleShow }>{ show ? "Hide" : "Show" }</span>
                    </div>

                    <label htmlFor="password_confirm">Confirm password</label>
                    <div className="password-container">
                        <input type={ showConfirm ? "text" : "password" } name="password_confirm" id="password_confirm" placeholder="••••••••••••••••••••" required />
                        <span onClick={ handleShowConfirm }>{ showConfirm ? "Hide" : "Show" }</span>
                    </div>

                    <button>Sign up</button>
                </form>

                <Link to="/">HOME</Link>
            </div>
        </div>
    );
}

export default SignUp;