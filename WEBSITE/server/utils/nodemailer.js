const nodemailer = require("nodemailer");

const gmailTransporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const CSS = `
    h1 {
        margin: 0px;
        color: #FF9358;
    }

    p {
        color: #687DC1;
    }
`;

//E-MAIL CLIENTS IGNORE EXTERNAL CSS FILE
const generateHTML = (body) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>pulse.</title>

                <style type="text/css">
                    ${CSS}
                </style>
            </head>

            <body>
                ${body}
            </body>
        </html>
    `;
};

const send = (res, emailValues) => {
    gmailTransporter.sendMail(
        emailValues,
        (error) => {
            if(error)
                res.json({ message: "EMAIL_SEND_ERROR" });
            else
                res.json({ message: "EMAIL_SEND_OK" });
        }
    );
};

exports.signupConfirmEmail = (req, res) => {
    if(req.body.email && req.body.firstName && req.body.lastName && req.body.activationToken) {
        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: req.body.email,
            subject: "pulse. signup confirm",
            html: generateHTML(`
                <h1>pulse. signup confirm</h1>

                <p>
                    Hi <strong>${escapeHtml(req.body.firstName)} ${escapeHtml(req.body.lastName)}</strong>,
                    <br>
                    Your registration is almost complete. We invite you to <a href="${process.env.BASE_URL}/api/activeUser/${req.body.activationToken}">click here</a> to confirm your e-mail address.
                </p>
            `)
        };

        send(res, emailValues);
    } else
        res.json({ message: "EMAIL_SEND_ERROR" });
};

exports.changePasswordRequest = (req, res) => {
    if(req.body.email && req.body.firstName && req.body.lastName && req.body.changePasswordToken) {
        const emailValues = {
            from: process.env.GMAIL_EMAIL,
            to: req.body.email,
            subject: "pulse. restore password",
            html: generateHTML(`
                <h1>pulse. restore password</h1>

                <p>
                    Hi <strong>${escapeHtml(req.body.firstName)} ${escapeHtml(req.body.lastName)}</strong>,
                    <br>
                    We have received a request to restore your password. <a href="${process.env.BASE_URL}/api/managePassword/restorePassword/${req.body.changePasswordToken}">Click here</a> to complete the procedure.
                </p>
            `)
        };

        send(res, emailValues);
    } else
        res.json({ message: "RESTORE_PASSWORD_ERROR" });
};