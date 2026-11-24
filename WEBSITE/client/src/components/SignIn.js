import "../styles/SignIn.css";

import helpers from "../helpers";

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

import { fetch_API } from "../fetch_API";

function SignIn() {
    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const [knownCredentials, setKnownCredentials] = useState({
        email: ""
    });
    const [loggedUser, setLoggedUser] = useState(null);

    const handleShow = () => {
        setShow(!show);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const notification = toast("Loading...", toast_JSON.wait);
        try {
            const response = await fetch(fetch_API.signin, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.get("email"),
                    password: formData.get("password")
                })
            });
            if (!response.ok) throw new Error("Sign-in request failed");
            const result = await response.json();
            switch (result?.message) {
                case "USER_NOT_EXISTS":
                    toast("The user doesn't exist", toast_JSON.error);
                    break;
                case "USER_NOT_ACTIVE":
                    toast("The user isn't active", toast_JSON.error);
                    break;
                case "RATE_LIMITED":
                    toast("Too many sign-in attempts. Please try again later.", toast_JSON.error);
                    break;
                case "SIGNIN_OK":
                    if (!result.user?.currentValidToken) throw new Error("Missing session token");
                    localStorage.setItem("loggedUser", JSON.stringify(result.user));
                    if (formData.get("remember") === "on") {
                        localStorage.setItem("email", String(formData.get("email")));
                    } else {
                        localStorage.removeItem("email");
                    }
                    localStorage.removeItem("password");
                    setLoggedUser(result.user);
                    break;
                default:
                    throw new Error("Unexpected sign-in response");
            }
        } catch (_) {
            toast("An error occurred. Please try again.", toast_JSON.error);
        } finally {
            toast.dismiss(notification);
        }
    };

    const handleForgotPassword = async () => {
        const form = document.querySelector("#signin-form");
        if (!form) return;
        const email = new FormData(form).get("email");
        if (!email) {
            toast("Enter your e-mail address", toast_JSON.error);
            return;
        }
        const notification = toast("Loading...", toast_JSON.wait);
        try {
            const response = await fetch(fetch_API.requestRestorePassword, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!response.ok) throw new Error("Password recovery request failed");
            const result = await response.json();
            switch (result?.message) {
                case "USER_NOT_FOUND":
                    toast("User not found", toast_JSON.error);
                    break;
                case "EMAIL_SEND_OK":
                    form.reset();
                    toast("Check your e-mail", toast_JSON.email);
                    break;
                default:
                    throw new Error("Password recovery unavailable");
            }
        } catch (_) {
            toast("An error occurred. Please try again.", toast_JSON.error);
        } finally {
            toast.dismiss(notification);
        }
    };

    useEffect(() => {
        helpers.checkComponent();

        // Only the email address may be remembered on this device.
        localStorage.removeItem("password");
        setKnownCredentials({ email: localStorage.getItem("email") || "" });
    }, []);

    useEffect(() => {
        if(loggedUser) {
            toast("Welcome", toast_JSON.success);
            navigate("/panel");
        }
    }, [loggedUser, navigate]);

    useEffect(() => {
        document.querySelector("#email").value = knownCredentials.email;

        if(knownCredentials.email !== "" && knownCredentials.email !== null)
            document.querySelector("#remember").checked = true;
    }, [knownCredentials]);

    return (
        <div className="SignInContainer">
            <div>
                <h3>Welcome!</h3>
                <p>Sign in to your account.</p>

                <form id="signin-form" onSubmit={ handleSubmit }>
                    <label htmlFor="email">E-mail</label>
                    <input type="email" name="email" id="email" placeholder="name@example.com" required />

                    <label htmlFor="password" id="password-label">Password</label>
                    <div id="password-container">
                        <input type={ show ? "text" : "password" } name="password" id="password" placeholder="••••••••••••••••••••" required />
                        <span onClick={ handleShow }>{ show ? "Hide" : "Show" }</span>
                    </div>

                    <div id="remember-container">
                        <input type="checkbox" id="remember" name="remember" />
                        <label htmlFor="remember">Remember me</label>
                    </div>

                    <label id="forgot-password" onClick={ handleForgotPassword }>Forgot password?</label>

                    <button>Sign in</button>
                </form>

                <Link to="/">HOME</Link>
            </div>
        </div>
    );
}

export default SignIn;