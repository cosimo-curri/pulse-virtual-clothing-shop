import "./styles/App.css";

import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ControlPanel from "./components/ControlPanel";
import ManageClothings from "./components/ManageClothings";
import HumanAcquisition from "./components/HumanAcquisition";
import VirtualAssistant from "./components/VirtualAssistant";

import Error from "./components/Error";

import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={ <Home /> } />
                <Route path="/signin" element={ <SignIn /> } />
                <Route path="/signup" element={ <SignUp /> } />
                <Route path="/panel" element={ <ControlPanel /> } />
                <Route path="/manageClothings" element={ <ManageClothings /> } />
                <Route path="/humanAcquisition" element={ <HumanAcquisition /> } />
                <Route path="/virtualAssistant" element={ <VirtualAssistant /> } />

                <Route path="*" element={ <Error /> } />
            </Routes>

            <Toaster
                position={ window.innerWidth <= 600 ? "bottom-center" : "bottom-right" }
                reverseOrder={false}
            />
        </>
    );
}

export default App;