const urlParams = new URLSearchParams(window.location.search);

const btnShow1 = document.getElementById("btnShow1");
const btnShow2 = document.getElementById("btnShow2");
const changePasswordForm = document.getElementById("changePasswordForm");

btnShow1.addEventListener("click", () => {
    const type = document.getElementById("newPassword1").type;

    if(type === "password") {
        document.getElementById("newPassword1").type = "text";
        document.getElementById("btnShow1").innerText = "Hide";
    } else {
        document.getElementById("newPassword1").type = "password";
        document.getElementById("btnShow1").innerText = "Show";
    }
});

btnShow2.addEventListener("click", () => {
    const type = document.getElementById("newPassword2").type;

    if(type === "password") {
        document.getElementById("newPassword2").type = "text";
        document.getElementById("btnShow2").innerText = "Hide";
    } else {
        document.getElementById("newPassword2").type = "password";
        document.getElementById("btnShow2").innerText = "Show";
    }
});

changePasswordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const password1 = formData.get("newPassword1");
    const password2 = formData.get("newPassword2");

    //CHECKING THE PASSWORDS HERE AND SERVER-SIDE
    if(password1 === password2) {
        const changePasswordToken = urlParams.get("changePasswordToken");

        fetch("/api/managePassword/restorePassword", {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                changePasswordToken: changePasswordToken,
                password1: password1,
                password2: password2
            })
        })
        .then(res => {
            if(res.ok)
                return res.json();
            else
                alert("An error occurred");
        })
        .then(obj => {
            switch(obj.message) {
                case "RESTORE_PASSWORD_ERROR":
                    alert("An error occurred");
                    location.href = "error.html";
                    break;
                
                case "PASSWORDS_NOT_MATCH":
                    alert("The passwords don't match");
                    break;

                case "WEAK_PASSWORD":
                    alert("The password is too weak.\n\nIt must contain at least:\n➡️ 8 characters\n➡️ 1 uppercase letter\n➡️ 1 lowercase letter\n➡️ 1 number\n➡️ 1 special character");
                    break;
                
                case "RESTORE_PASSWORD_OK":
                    location.href = "/restore_password_confirm.html";
                    break;

                default: break;
            }
            
            if(Array.isArray(obj)) {
                const error = obj[0].message;

                if(error === "WEAK_PASSWORD") {
                    alert("The password is too weak.\n\nIt must contain at least:\n➡️ 8 characters\n➡️ 1 uppercase letter\n➡️ 1 lowercase letter\n➡️ 1 number\n➡️ 1 special character");
                    location.reload();
                }
            }
        })
        .catch(() => {
            alert("An error occurred");
            location.href = "error.html";
        });
    } else
        alert("The passwords don't match");
});