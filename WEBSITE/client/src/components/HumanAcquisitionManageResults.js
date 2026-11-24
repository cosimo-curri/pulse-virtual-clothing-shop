import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { fetch_API } from "../fetch_API";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

function HumanAcquisitionManageResults(props) {
    const navigate = useNavigate();

    const [armCircumferenceCm, setArmCircumferenceCm] = useState("");
    const [armLengthCm, setArmLengthCm] = useState("");
    const [chestCircumferenceCm, setChestCircumferenceCm] = useState("");
    const [legLengthCm, setLegLengthCm] = useState("");
    const [pelvisCircumferenceCm, setPelvisCircumferenceCm] = useState("");
    const [shouldersWidthCm, setShouldersWidthCm] = useState("");
    const [thighCircumferenceCm, setThighCircumferenceCm] = useState("");
    const [underChestCircumferenceCm, setUnderChestCircumferenceCm] = useState("");
    const [waistCircumferenceCm, setWaistCircumferenceCm] = useState("");

    const armCircumferenceCmRef = useRef(null);
    const armLengthCmRef = useRef(null);
    const chestCircumferenceCmRef = useRef(null);
    const legLengthCmRef = useRef(null);
    const pelvisCircumferenceCmRef = useRef(null);
    const shouldersWidthCmRef = useRef(null);
    const thighCircumferenceCmRef = useRef(null);
    const underChestCircumferenceCmRef = useRef(null);
    const waistCircumferenceCmRef = useRef(null);

    useEffect(() => {
        setArmCircumferenceCm(props.humanAcquisitionFinalResults.armCircumferenceCm.toFixed(2));
        setArmLengthCm(props.humanAcquisitionFinalResults.armLengthCm.toFixed(2));
        setChestCircumferenceCm(props.humanAcquisitionFinalResults.chestCircumferenceCm.toFixed(2));
        setLegLengthCm(props.humanAcquisitionFinalResults.legLengthCm.toFixed(2));
        setPelvisCircumferenceCm(props.humanAcquisitionFinalResults.pelvisCircumferenceCm.toFixed(2));
        setShouldersWidthCm(props.humanAcquisitionFinalResults.shouldersWidthCm.toFixed(2));
        setThighCircumferenceCm(props.humanAcquisitionFinalResults.thighCircumferenceCm.toFixed(2));
        setUnderChestCircumferenceCm(props.humanAcquisitionFinalResults.underChestCircumferenceCm.toFixed(2));
        setWaistCircumferenceCm(props.humanAcquisitionFinalResults.waistCircumferenceCm.toFixed(2));

        armCircumferenceCmRef.current.value = armCircumferenceCm;
        armLengthCmRef.current.value = armLengthCm;
        chestCircumferenceCmRef.current.value = chestCircumferenceCm;
        legLengthCmRef.current.value = legLengthCm;
        pelvisCircumferenceCmRef.current.value = pelvisCircumferenceCm;
        shouldersWidthCmRef.current.value = shouldersWidthCm;
        thighCircumferenceCmRef.current.value = thighCircumferenceCm;
        underChestCircumferenceCmRef.current.value = underChestCircumferenceCm;
        waistCircumferenceCmRef.current.value = waistCircumferenceCm;
    }, [
        armCircumferenceCm,
        armLengthCm,
        chestCircumferenceCm,
        legLengthCm,
        pelvisCircumferenceCm,
        shouldersWidthCm,
        thighCircumferenceCm,
        underChestCircumferenceCm,
        waistCircumferenceCm,
        props.humanAcquisitionFinalResults.armCircumferenceCm,
        props.humanAcquisitionFinalResults.armLengthCm,
        props.humanAcquisitionFinalResults.chestCircumferenceCm,
        props.humanAcquisitionFinalResults.legLengthCm,
        props.humanAcquisitionFinalResults.pelvisCircumferenceCm,
        props.humanAcquisitionFinalResults.shouldersWidthCm,
        props.humanAcquisitionFinalResults.thighCircumferenceCm,
        props.humanAcquisitionFinalResults.underChestCircumferenceCm,
        props.humanAcquisitionFinalResults.waistCircumferenceCm
    ]);

    const handleClosePopup = () => {
        props.setPopupVisibility(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        toast("Loading...", toast_JSON.wait);
        
        fetch(fetch_API.trainingByFeedback, {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                token: JSON.parse(localStorage.getItem("loggedUser") || "null")?.currentValidToken || ""
            }),
            body: JSON.stringify({
                csvFields: {
                    armCircumferenceCmRef: armCircumferenceCmRef.current.value,
                    armLengthCmRef: armLengthCmRef.current.value,
                    chestCircumferenceCmRef: chestCircumferenceCmRef.current.value,
                    legLengthCmRef: legLengthCmRef.current.value,
                    pelvisCircumferenceCmRef: pelvisCircumferenceCmRef.current.value,
                    shouldersWidthCmRef: shouldersWidthCmRef.current.value,
                    thighCircumferenceCmRef: thighCircumferenceCmRef.current.value,
                    underChestCircumferenceCmRef: underChestCircumferenceCmRef.current.value,
                    waistCircumferenceCmRef: waistCircumferenceCmRef.current.value,
                    height: props.humanHeight,
                    armPx: props.humanAcquisitionPx.armPx,
                    chestFrontPx: props.humanAcquisitionPx.chestFrontPx,
                    chestSidePx: props.humanAcquisitionPx.chestSidePx,
                    bustFrontPx: props.humanAcquisitionPx.bustFrontPx,
                    bustSidePx: props.humanAcquisitionPx.bustSidePx,
                    gluteusFrontPx: props.humanAcquisitionPx.gluteusFrontPx,
                    gluteusSidePx: props.humanAcquisitionPx.gluteusSidePx,
                    legPx: props.humanAcquisitionPx.legPx,
                    bellyFrontPx: props.humanAcquisitionPx.bellyFrontPx,
                    bellySidePx: props.humanAcquisitionPx.bellySidePx,
                    shouldersPx: props.humanAcquisitionPx.shouldersPx,
                    armLengthPx: props.humanAcquisitionPx.armLengthPx,
                    legLengthPx: props.humanAcquisitionPx.legLengthPx
                }
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
                case "FEEDBACK_RECEIVED":
                case "UPDATE_REGRESSION_PARAMETERS_OK":
                    toast("Thank you for contributing to the improvement of the system", toast_JSON.success);
                    break;

                case "UPDATE_REGRESSION_PARAMETERS_ERROR":
                    toast("An error occurred", toast_JSON.error);
                    break;

                case "RATE_LIMITED":
                    toast("Too many requests. Please try again later.", toast_JSON.error);
                    break;
                
                default: break;
            }

            navigate("/panel");
        });
    }

    return (
        <div className="HumanAcquisitionManageResultsContainer">
            <h1 id="button-close" onClick={ handleClosePopup }>❌</h1>

            <div id="info-container">
                <p id="info-container-title">Predicted measurements</p>

                <ul>
                    <li>
                        <span>Height</span>
                        <p>{ props.humanHeight } cm</p>
                    </li>

                    <li>
                        <span>Arm circumference</span>
                        <p>{ armCircumferenceCm } cm</p>
                    </li>

                    <li>
                        <span>Arm length</span>
                        <p>{ armLengthCm } cm</p>
                    </li>

                    <li>
                        <span>Thigh circumference</span>
                        <p>{ thighCircumferenceCm } cm</p>
                    </li>

                    <li>
                        <span>Leg length</span>
                        <p>{ legLengthCm } cm</p>
                    </li>

                    <li>
                        <span>Shoulders width</span>
                        <p>{ shouldersWidthCm } cm</p>
                    </li>

                    <li>
                        <span>Chest circumference</span>
                        <p>{ chestCircumferenceCm } cm</p>
                    </li>

                    <li>
                        <span>Bust circumference</span>
                        <p>{ underChestCircumferenceCm } cm</p>
                    </li>

                    <li>
                        <span>Belly circumference</span>
                        <p>{ waistCircumferenceCm } cm</p>
                    </li>

                    <li>
                        <span>Pelvis circumference</span>
                        <p>{ pelvisCircumferenceCm } cm</p>
                    </li>
                </ul>
            </div>

            <form onSubmit={ handleSubmit }>
                <h1>Send feedback</h1>

                <label htmlFor="heightCm">Height (cm)</label>
                <input type="number" id="heightCm" name="heightCm" step="0.01" min="0.01" placeholder="180" value={ props.humanHeight } disabled />

                <label htmlFor="armCircumferenceCm">Arm circumference (cm)</label>
                <input ref={ armCircumferenceCmRef } type="number" id="armCircumferenceCm" name="armCircumferenceCm" step="0.01" min="0.01" placeholder="24" required />

                <label htmlFor="armLengthCm">Arm length (cm)</label>
                <input ref={ armLengthCmRef } type="number" id="armLengthCm" name="armLengthCm" step="0.01" min="0.01" placeholder="55" />

                <label htmlFor="thighCircumferenceCm">Thigh circumference (cm)</label>
                <input ref={ thighCircumferenceCmRef } type="number" id="thighCircumferenceCm" name="thighCircumferenceCm" step="0.01" min="0.01" placeholder="49" required />
            
                <label htmlFor="legLengthCm">Leg length (cm)</label>
                <input ref={ legLengthCmRef } type="number" id="legLengthCm" name="legLengthCm" step="0.01" min="0.01" placeholder="95" />

                <label htmlFor="shouldersWidthCm">Shoulders width (cm)</label>
                <input ref={ shouldersWidthCmRef } type="number" id="shouldersWidthCm" name="shouldersWidthCm" step="0.01" min="0.01" placeholder="40" required />
                
                <label htmlFor="chestCircumferenceCm">Chest circumference (cm)</label>
                <input ref={ chestCircumferenceCmRef } type="number" id="chestCircumferenceCm" name="chestCircumferenceCm" step="0.01" min="0.01" placeholder="79" required />

                <label htmlFor="underChestCircumferenceCm">Bust circumference (cm)</label>
                <input ref={ underChestCircumferenceCmRef } type="number" id="underChestCircumferenceCm" name="underChestCircumferenceCm" step="0.01" min="0.01" placeholder="71" required />

                <label htmlFor="waistCircumferenceCm">Belly circumference (cm)</label>
                <input ref={ waistCircumferenceCmRef } type="number" id="waistCircumferenceCm" name="waistCircumferenceCm" step="0.01" min="0.01" placeholder="68" required />

                <label htmlFor="pelvisCircumferenceCm">Pelvis circumference (cm)</label>
                <input ref={ pelvisCircumferenceCmRef } type="number" id="pelvisCircumferenceCm" name="pelvisCircumferenceCm" step="0.01" min="0.01" placeholder="88" required />
            
                <button>Update</button>
            </form>
        </div>
    );
}

export default HumanAcquisitionManageResults;