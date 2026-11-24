import "../styles/UserControlPanel.css";

import helpers from "../helpers";

import { useEffect } from "react";

function UserControlPanel(props) {    
    useEffect(() => {
        helpers.checkComponent();
    }, []);

    return (
        <div className="UserControlPanelContainer">
            <div id="user-info">
                <img src="./images/user_logo.jpg" alt="User logo" />
                <div>
                    <h3>{ props.loggedUser.email }</h3>
                    <p>{props.loggedUser.firstName} {props.loggedUser.lastName}</p>
                </div>
            </div>
            
            <div id="page-content">
                <div id="grid-container">
                    <div className="grid-item" onClick={ props.handleManageClothings }>
                        <img src="./images/clothing.jpg" alt="Manage clothings" />
                        <p>Manage clothings</p>
                    </div>

                    <div className="grid-item" onClick={ props.handleHumanAcquisition }>
                        <img src="./images/human.jpg" alt="Human acquisition" />
                        <p>Human acquisition</p>
                    </div>

                    <div className="grid-item" onClick={ props.handleVirtualAssistant }>
                        <img src="./images/selma.jpg" alt="Selma" />
                        <p>Selma</p>
                    </div>

                    <div className="grid-item" onClick={ props.handleLogout }>
                        <img src="./images/logout.jpg" alt="Logout" />
                        <p>Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserControlPanel;