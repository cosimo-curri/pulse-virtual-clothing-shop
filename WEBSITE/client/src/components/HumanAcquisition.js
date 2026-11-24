import "../styles/HumanAcquisition.css";

import helpers from "../helpers";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

import "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import { drawKeypoints, drawSkeleton } from "../utilities";

import { fetch_API } from "../fetch_API";

import toast from "react-hot-toast";
import { toast_JSON } from "../toast_JSON";

import Webcam from "react-webcam";
import Sound from "react-sound";

import HumanAcquisitionManageResults from "../components/HumanAcquisitionManageResults";

function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(new Error("ACQUISITION_CANCELLED"));
        const timeout = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        function onAbort() {
            clearTimeout(timeout);
            reject(new Error("ACQUISITION_CANCELLED"));
        }
        signal.addEventListener("abort", onAbort, { once: true });
    });
}

function HumanAcquisition() {
    const navigate = useNavigate();

    const resolutionWidth = 300;
    const resolutionHeight = 225;
    
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const canvasBodyPixRef = useRef(null);

    const [countdown, setCountdown] = useState(null);
    const detectionIntervalRef = useRef(null);
    const poseNetRef = useRef(null);
    const acquisitionAbortRef = useRef(null);
    const mountedRef = useRef(false);
    const [isPaused, setIsPaused] = useState(false);
    const [acquisitionNumber, setAcquisitionNumber] = useState(1);
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);

    const [posenetPose, setPosenetPose] = useState(null);

    const [screenshots, setScreenshots] = useState([]);
    const [segmentations, setSegmentations] = useState([]);

    const [jsonSegmentFront1, setJsonSegmentFront1] = useState(null);
    const [jsonSegmentFront2, setJsonSegmentFront2] = useState(null);
    const [jsonSegmentSide, setJsonSegmentSide] = useState(null);

    const [humanHeight, setHumanHeight] = useState(null);

    const [humanAcquisitionFinalResults, setHumanAcquisitionFinalResults] = useState(null);
    const [humanAcquisitionPx, setHumanAcquisitionPx] = useState(null);
    const [popupVisibility, setPopupVisibility] = useState(true);

    const detect = useCallback(async (net) => {
        const video = webcamRef.current?.video;
        if (!mountedRef.current || !video || video.readyState !== 4) return;

        video.width = resolutionWidth;
        video.height = resolutionHeight;
        const pose = await net.estimateSinglePose(video);
        if (!mountedRef.current) return;

        setPosenetPose(pose);
        drawCanvas(pose, video, resolutionWidth, resolutionHeight, canvasRef);
    }, []);

    const runTensorflow = useCallback(async (isCancelled) => {
        const net = await posenet.load({
            inputResolution: {
                width: resolutionWidth,
                height: resolutionHeight
            },
            scale: 0.5
        });

        // A model that finishes loading after navigation must not start a new timer.
        if (isCancelled()) {
            net.dispose?.();
            return;
        }
        poseNetRef.current = net;
        detectionIntervalRef.current = setInterval(() => {
            detect(net).catch(() => {
                // Ignore transient camera/model errors; the next sample can recover.
            });
        }, 1000);
    }, [detect]);

    const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
        if(canvas.current) {
            const ctx = canvas.current.getContext("2d");
            
            canvas.current.width = videoWidth;
            canvas.current.height = videoHeight;

            drawKeypoints(pose["keypoints"], 0.5, ctx);
            drawSkeleton(pose["keypoints"], 0.5, ctx);
        }
    }

    const handleTakePhoto = async () => {
        if (acquisitionAbortRef.current) return;
        const controller = new AbortController();
        acquisitionAbortRef.current = controller;
        const { signal } = controller;
        setIsPaused(true);

        try {
            if (acquisitionNumber !== 1) {
                const canvas = canvasRef.current;
                const canvasBodyPix = canvasBodyPixRef.current;
                canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
                canvasBodyPix?.getContext("2d")?.clearRect(0, 0, 640, 480);
                await webcamRef.current?.video?.play();
            }

            for (let i = 10; i > 0; i--) {
                setCountdown(i);
                await sleep(1000, signal);
            }
            if (signal.aborted || !mountedRef.current) return;

            setCountdown(null);
            setIsSoundPlaying(true);
            // Pose detection is only required for the first acquisition.
            if (detectionIntervalRef.current !== null) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
            }

            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;
            if (!video || !canvas || !canvasBodyPixRef.current) throw new Error("Camera unavailable");
            video.pause();
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            video.width = 640;
            video.height = 480;

            const segmenter = await bodySegmentation.createSegmenter(
                bodySegmentation.SupportedModels.BodyPix,
                { architecture: "ResNet50", outputStride: 16, quantBytes: 4 }
            );
            try {
                if (signal.aborted || !mountedRef.current) return;
                const people = await segmenter.segmentPeople(video, {
                    multiSegmentation: false,
                    segmentBodyParts: false
                });
                if (signal.aborted || !mountedRef.current) return;
                if (!people.length || !people[0]?.mask?.mask) throw new Error("Person not detected");

                const imageSrc = webcamRef.current?.getScreenshot();
                if (!imageSrc) throw new Error("Could not capture image");
                const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
                    people,
                    { r: 255, g: 0, b: 0, a: 255 },
                    { r: 0, g: 0, b: 0, a: 255 }
                );
                if (signal.aborted || !mountedRef.current) return;
                bodySegmentation.drawMask(
                    canvasBodyPixRef.current, video, backgroundDarkeningMask, 1, 0, false
                );
                setScreenshots(current => [...current, imageSrc]);
                setSegmentations(current => [...current, people[0].mask.mask]);
                setAcquisitionNumber(current => current + 1);
            } finally {
                segmenter.dispose?.();
            }
        } catch (_) {
            if (!signal.aborted && mountedRef.current) {
                toast("An error occurred during acquisition", toast_JSON.error);
                webcamRef.current?.video?.play()?.catch(() => {});
                if (acquisitionNumber === 1 && poseNetRef.current && detectionIntervalRef.current === null) {
                    detectionIntervalRef.current = setInterval(() => {
                        detect(poseNetRef.current).catch(() => {});
                    }, 1000);
                }
            }
        } finally {
            if (mountedRef.current && !signal.aborted) {
                setCountdown(null);
                setIsPaused(false);
            }
            if (acquisitionAbortRef.current === controller) acquisitionAbortRef.current = null;
        }
    };

    const resizeImageFromURL = (url, newWidth, newHeight) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
    
            img.onload = function() {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = newWidth;
                canvas.height = newHeight;

                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                const resizedDataURL = canvas.toDataURL();

                resolve(resizedDataURL);
            };
    
            img.onerror = function() {
                reject(new Error("IMAGE_RESIZE_ERROR"));
            };
    
            img.src = url;
        });
    }

    const matrixToImageUrl = (matrix) => {
        const height = matrix.length;
        const width = matrix[0].length;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
    
        for(let y=0; y<height; y++) {
            for(let x=0; x<width; x++) {
                let pixel = matrix[y][x];
                let index = (y * width + x) * 4;

                data[index] = pixel[0]; //R
                data[index + 1] = pixel[1]; //G
                data[index + 2] = pixel[2]; //B
                data[index + 3] = pixel[3]; //A
            }
        }
    
        ctx.putImageData(imageData, 0, 0);

        return canvas.toDataURL();
    }

    const imageDataToMatrix = (imageData) => {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const matrix = [];
    
        for(let y=0; y<height; y++) {
            const row = [];

            for(let x=0; x<width; x++) {
                const index = (y * width + x) * 4;
                const pixel = [data[index], data[index + 1], data[index + 2], data[index + 3]];

                row.push(pixel);
            }

            matrix.push(row);
        }
    
        return matrix;
    }

    const arraysDifferent = (array1, array2) => {
        if(array1.length !== array2.length)
            return true;
        
        for(let i=0; i<array1.length; i++) {
            if(array1[i] !== array2[i])
                return true;
        }

        return false;
    }

    const segmentAndNormalizeShape = useCallback((matrix, matrixScreenshot, h, o) => {
        const rows = matrix.length;
        const columns = matrix[0].length;

        let widthOffsetMin = columns;
        let widthOffsetMax = 0;
        let heightOffsetMin = rows;
        let heightOffsetMax = 0;

        for(let i=0; i<rows; i++) {
            for(let j=0; j<columns; j++) {
                const pixel = matrix[i][j];

                if(arraysDifferent(pixel, [0, 0, 0, 0]) && j < widthOffsetMin)
                    widthOffsetMin = j;

                if(arraysDifferent(pixel, [0, 0, 0, 0]) && j > widthOffsetMax)
                    widthOffsetMax = j;

                if(arraysDifferent(pixel, [0, 0, 0, 0]) && i < heightOffsetMin)
                    heightOffsetMin = i;

                if(arraysDifferent(pixel, [0, 0, 0, 0]) && i > heightOffsetMax)
                    heightOffsetMax = i;
            }
        }

        const newMatrix = [];
        const newMatrixScreenshot = [];

        for(let i=heightOffsetMin; i<=heightOffsetMax; i++) {
            let row = [];
            let rowScreenshot = [];

            for(let j=widthOffsetMin; j<=widthOffsetMax; j++) {
                row.push(matrix[i][j]);
                rowScreenshot.push(matrixScreenshot[i][j]);
            }

            newMatrix.push(row);
            newMatrixScreenshot.push(rowScreenshot);
        }

        //NORMALIZING IMAGE DIMENSIONS
        //SEGMENTATIONS 640x480
        //SCREENSHOTS 300x225

        const widthNewMatrix = newMatrix[0].length;
        const heightNewMatrix = newMatrix.length;

        const heightNormalized = Math.ceil(350 * h / 180);
        const widthNormalized = Math.ceil(widthNewMatrix * heightNormalized / heightNewMatrix);

        Promise.all([
            resizeImageFromURL(matrixToImageUrl(newMatrix), widthNormalized, heightNormalized),
            resizeImageFromURL(matrixToImageUrl(newMatrixScreenshot), widthNormalized, heightNormalized)
        ])
        .then(([resizedImageUrl1, resizedImageUrl2]) => {
            return Promise.all([
                imageUrlToImageData(resizedImageUrl1),
                imageUrlToImageData(resizedImageUrl2)
            ]);
        })
        .then(([imageData1, imageData2]) => {
            const newMatrixNormalized = imageDataToMatrix(imageData1);
            const newMatrixScreenshotNormalized = imageDataToMatrix(imageData2);

            const jsonSegment = {
                newMatrix: newMatrixNormalized,
                newMatrixScreenshot: newMatrixScreenshotNormalized
            };

            switch(o) {
                case 1:
                    setJsonSegmentFront1(jsonSegment);
                    break;
                    
                case 2:
                    setJsonSegmentFront2(jsonSegment);
                    break;

                case 3:
                    setJsonSegmentSide(jsonSegment);
                    break;

                default: break;
            }
        })
        .catch(() => {
            toast("An error occurred", toast_JSON.error);
        });
    }, []);

    const imageUrlToImageData = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve(imageData);
            };

            img.onerror = function() {
                reject(new Error("IMAGE_CONVERSION_ERROR"));
            };

            img.src = url;
        });
    }

    useEffect(() => {
        if(segmentations.length === 3 && screenshots.length === 3) {
            let frontSegmentation1 = segmentations[0];
            let frontSegmentation2 = segmentations[1];
            let sideSegmentation = segmentations[2];

            const frontScreenshot1 = screenshots[0];
            const frontScreenshot2 = screenshots[1];
            const sideScreenshot = screenshots[2];

            Promise.all([
                resizeImageFromURL(matrixToImageUrl(imageDataToMatrix(frontSegmentation1)), 300, 225),
                resizeImageFromURL(matrixToImageUrl(imageDataToMatrix(frontSegmentation2)), 300, 225),
                resizeImageFromURL(matrixToImageUrl(imageDataToMatrix(sideSegmentation)), 300, 225),
                imageUrlToImageData(frontScreenshot1),
                imageUrlToImageData(frontScreenshot2),
                imageUrlToImageData(sideScreenshot)
            ])
            .then(([resizedImageUrl1, resizedImageUrl2, resizedImageUrl3, frontScreenshotMatrix1, frontScreenshotMatrix2, sideScreenshotMatrix]) => {                
                return Promise.all([
                    imageUrlToImageData(resizedImageUrl1),
                    imageUrlToImageData(resizedImageUrl2),
                    imageUrlToImageData(resizedImageUrl3),
                    imageDataToMatrix(frontScreenshotMatrix1),
                    imageDataToMatrix(frontScreenshotMatrix2),
                    imageDataToMatrix(sideScreenshotMatrix)
                ]);
            })
            .then(([frontSegmentationImageData1, frontSegmentationImageData2, sideSegmentationImageData, frontScreenshotMatrix1, frontScreenshotMatrix2, sideScreenshotMatrix]) => {
                frontSegmentation1 = frontSegmentationImageData1;
                frontSegmentation2 = frontSegmentationImageData2;
                sideSegmentation = sideSegmentationImageData;

                const frontMatrix1 = imageDataToMatrix(frontSegmentation1);
                const frontMatrix2 = imageDataToMatrix(frontSegmentation2);
                const sideMatrix = imageDataToMatrix(sideSegmentation);
            
                segmentAndNormalizeShape(frontMatrix1, frontScreenshotMatrix1, humanHeight, 1);
                segmentAndNormalizeShape(frontMatrix2, frontScreenshotMatrix2, humanHeight, 2);
                segmentAndNormalizeShape(sideMatrix, sideScreenshotMatrix, humanHeight, 3);
            })
            .catch(() => {
                toast("An error occurred", toast_JSON.error);
            });
        }
    }, [segmentations, screenshots, segmentAndNormalizeShape, humanHeight]);

    const normalizePoint = (pointX, pointY, originalWidth, originalHeight, newWidth, newHeight) => {
        const widthRatio = newWidth / originalWidth;
        const heightRatio = newHeight / originalHeight;

        const newPointX = Math.ceil(pointX * widthRatio);
        const newPointY = Math.ceil(pointY * heightRatio);

        return {
            x: newPointX,
            y: newPointY
        }
    }

    const pointDistance = (x1, y1, x2, y2) => {
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return distance;
    }

    const pxLength = useCallback((matrix, type, pose) => {
        const newWidth = matrix[0].length;
        const newHeight = matrix.length;

        //SEE BELOW FOR DIMENSION REFERENCES
        const humanMeasurementPoints = {
            arm_px: {
                pointX: 60,
                pointY: 0
            },
            chest_front_px: {
                pointX: 0,
                pointY: 110
            },
            chest_side_px: {
                pointX: 0,
                pointY: 110
            },
            bust_front_px: {
                pointX: 0,
                pointY: 95
            },
            bust_side_px: {
                pointX: 0,
                pointY: 95
            },
            gluteus_front_px: {
                pointX: 0,
                pointY: 225
            },
            gluteus_side_px: {
                pointX: 0,
                pointY: 225
            },
            leg_px: {
                pointX: 0,
                pointY: 260
            },
            belly_front_px: {
                pointX: 0,
                pointY: 170
            },
            belly_side_px: {
                pointX: 0,
                pointY: 170
            },
            shoulders_px: {
                pointX: 0,
                pointY: 90
            }
        };

        const humanMeasurementDimensionReferences = {
            front1: {
                width: 140,
                height: 350
            },
            front2: {
                width: 290,
                height: 350
            },
            side: {
                width: 210,
                height: 350
            }
        };

        if(type === "SIDE") {
            const armPxPointNormalized = normalizePoint(humanMeasurementPoints.arm_px.pointX, humanMeasurementPoints.arm_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
            const chestSidePxPointNormalized = normalizePoint(humanMeasurementPoints.chest_side_px.pointX, humanMeasurementPoints.chest_side_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
            const bustSidePxPointNormalized = normalizePoint(humanMeasurementPoints.bust_side_px.pointX, humanMeasurementPoints.bust_side_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
            const gluteusSidePxPointNormalized = normalizePoint(humanMeasurementPoints.gluteus_side_px.pointX, humanMeasurementPoints.gluteus_side_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
            const legPxPointNormalized = normalizePoint(humanMeasurementPoints.leg_px.pointX, humanMeasurementPoints.leg_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
            const bellySidePxPointNormalized = normalizePoint(humanMeasurementPoints.belly_side_px.pointX, humanMeasurementPoints.belly_side_px.pointY, humanMeasurementDimensionReferences.side.width, humanMeasurementDimensionReferences.side.height, newWidth, newHeight);
        
            let armPx = 0;
            let chestSidePx = 0;
            let bustSidePx = 0;
            let gluteusSidePx = 0;
            let legPx = 0;
            let bellySidePx = 0;

            const rightShoulderPoint = pose.keypoints[6].position;
            const rightElbowPoint = pose.keypoints[8].position;
            const rightWristPoint = pose.keypoints[10].position;

            const rightHipPoint = pose.keypoints[12].position;
            const rightKneePoint = pose.keypoints[14].position;
            const rightAnklePoint = pose.keypoints[16].position;

            const rightShoulderPointNormalized = normalizePoint(rightShoulderPoint.x, rightShoulderPoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);
            const rightElbowPointNormalized = normalizePoint(rightElbowPoint.x, rightElbowPoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);
            const rightWristPointNormalized = normalizePoint(rightWristPoint.x, rightWristPoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);
            
            const rightHipPointNormalized = normalizePoint(rightHipPoint.x, rightHipPoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);
            const rightKneePointNormalized = normalizePoint(rightKneePoint.x, rightKneePoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);
            const rightAnklePointNormalized = normalizePoint(rightAnklePoint.x, rightAnklePoint.y, resolutionWidth, resolutionHeight, newWidth, newHeight);

            const upperArmLength = pointDistance(rightShoulderPointNormalized.x, rightShoulderPointNormalized.y, rightElbowPointNormalized.x, rightElbowPointNormalized.y);
            const lowerArmLength = pointDistance(rightElbowPointNormalized.x, rightElbowPointNormalized.y, rightWristPointNormalized.x, rightWristPointNormalized.y);

            const upperLegLength = pointDistance(rightHipPointNormalized.x, rightHipPointNormalized.y, rightKneePointNormalized.x, rightKneePointNormalized.y);
            const lowerLegLength = pointDistance(rightKneePointNormalized.x, rightKneePointNormalized.y, rightAnklePointNormalized.x, rightAnklePointNormalized.y);

            const armLengthPx = Math.ceil(upperArmLength + lowerArmLength);
            const legLengthPx = Math.ceil(upperLegLength + lowerLegLength);
            
            for(let i=0; i<newHeight; i++) {
                if(arraysDifferent(matrix[i][armPxPointNormalized.x], [0, 0, 0, 0]))
                    armPx++;
            }

            for(let i=0; i<newWidth; i++) {
                if(arraysDifferent(matrix[chestSidePxPointNormalized.y][i], [0, 0, 0, 0]))
                    chestSidePx++;

                if(arraysDifferent(matrix[bustSidePxPointNormalized.y][i], [0, 0, 0, 0]))
                    bustSidePx++;

                if(arraysDifferent(matrix[gluteusSidePxPointNormalized.y][i], [0, 0, 0, 0]))
                    gluteusSidePx++;

                if(arraysDifferent(matrix[legPxPointNormalized.y][i], [0, 0, 0, 0]))
                    legPx++;

                if(arraysDifferent(matrix[bellySidePxPointNormalized.y][i], [0, 0, 0, 0]))
                    bellySidePx++;
            }
            
            return {
                armPx: armPx,
                chestSidePx: chestSidePx,
                bustSidePx: bustSidePx,
                gluteusSidePx: gluteusSidePx,
                legPx: legPx,
                bellySidePx: bellySidePx,
                armLengthPx: armLengthPx,
                legLengthPx: legLengthPx
            };
        } else if(type === "FRONT1") {
            const shouldersPxPointNormalized = normalizePoint(humanMeasurementPoints.shoulders_px.pointX, humanMeasurementPoints.shoulders_px.pointY, humanMeasurementDimensionReferences.front1.width, humanMeasurementDimensionReferences.front1.height, newWidth, newHeight);
        
            let shouldersPx = 0;

            for(let i=0; i<newWidth; i++) {
                if(arraysDifferent(matrix[shouldersPxPointNormalized.y][i], [0, 0, 0, 0]))
                    shouldersPx++;
            }

            return {
                shouldersPx: shouldersPx
            };
        } else if(type === "FRONT2") {
            const chestFrontPxPointNormalized = normalizePoint(humanMeasurementPoints.chest_front_px.pointX, humanMeasurementPoints.chest_front_px.pointY, humanMeasurementDimensionReferences.front2.width, humanMeasurementDimensionReferences.front2.height, newWidth, newHeight);
            const bustFrontPxPointNormalized = normalizePoint(humanMeasurementPoints.bust_front_px.pointX, humanMeasurementPoints.bust_front_px.pointY, humanMeasurementDimensionReferences.front2.width, humanMeasurementDimensionReferences.front2.height, newWidth, newHeight);
            const gluteusFrontPxPointNormalized = normalizePoint(humanMeasurementPoints.gluteus_front_px.pointX, humanMeasurementPoints.gluteus_front_px.pointY, humanMeasurementDimensionReferences.front2.width, humanMeasurementDimensionReferences.front2.height, newWidth, newHeight);
            const bellyFrontPxPointNormalized = normalizePoint(humanMeasurementPoints.belly_front_px.pointX, humanMeasurementPoints.belly_front_px.pointY, humanMeasurementDimensionReferences.front2.width, humanMeasurementDimensionReferences.front2.height, newWidth, newHeight);
        
            let chestFrontPx = 0;
            let bustFrontPx = 0;
            let gluteusFrontPx = 0;
            let bellyFrontPx = 0;

            for(let i=0; i<newWidth; i++) {
                if(arraysDifferent(matrix[chestFrontPxPointNormalized.y][i], [0, 0, 0, 0]))
                    chestFrontPx++;

                if(arraysDifferent(matrix[bustFrontPxPointNormalized.y][i], [0, 0, 0, 0]))
                    bustFrontPx++;
                
                if(arraysDifferent(matrix[gluteusFrontPxPointNormalized.y][i], [0, 0, 0, 0]))
                    gluteusFrontPx++;

                if(arraysDifferent(matrix[bellyFrontPxPointNormalized.y][i], [0, 0, 0, 0]))
                    bellyFrontPx++;
            }

            return {
                chestFrontPx: chestFrontPx,
                bustFrontPx: bustFrontPx,
                gluteusFrontPx: gluteusFrontPx,
                bellyFrontPx: bellyFrontPx
            };
        }
    }, []);

    useEffect(() => {
        if(jsonSegmentFront1 && jsonSegmentFront2 && jsonSegmentSide && posenetPose) {
            const front1 = pxLength(jsonSegmentFront1.newMatrix, "FRONT1");
            const front2 = pxLength(jsonSegmentFront2.newMatrix, "FRONT2");
            const side = pxLength(jsonSegmentSide.newMatrix, "SIDE", posenetPose);

            const mergedJson = {
                ...front1,
                ...front2,
                ...side
            };

            setHumanAcquisitionPx(mergedJson);

            toast("Loading...", toast_JSON.wait);

            fetch(fetch_API.svd, {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json",
                    token: JSON.parse(localStorage.getItem("loggedUser") || "null")?.currentValidToken || ""
                }),
                body: JSON.stringify({
                    imageUrlFront1: matrixToImageUrl(jsonSegmentFront1.newMatrixScreenshot),
                    imageUrlFront2: matrixToImageUrl(jsonSegmentFront2.newMatrixScreenshot),
                    imageUrlSide: matrixToImageUrl(jsonSegmentSide.newMatrixScreenshot)
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Request failed (${res.status})`);
                return res.json();
            })
            .then(obj => {
                switch(obj?.message) {
                    case "SVD_OK":
                        toast("The acquisitions has been saved", toast_JSON.success);
                        break;

                    case "SVD_ERROR":
                        toast("An error occurred with the acquisitions saving", toast_JSON.error);
                        break;
                    
                    default:
                        toast("An error occurred", toast_JSON.error);
                }
            })
            .catch(() => toast("An error occurred", toast_JSON.error));

            fetch(fetch_API.predict, {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json",
                    token: JSON.parse(localStorage.getItem("loggedUser") || "null")?.currentValidToken || ""
                }),
                body: JSON.stringify({
                    measurements: mergedJson
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Request failed (${res.status})`);
                return res.json();
            })
            .then(obj => {
                switch(obj?.message) {
                    case "PREDICT_OK":
                        toast("Prediction successful", toast_JSON.success);

                        const predictedMeasurements = obj.predictedMeasurements;
                        setHumanAcquisitionFinalResults(predictedMeasurements);
                        break;

                    case "PREDICT_ERROR":
                        toast("An error occurred", toast_JSON.error);
                        break;
                    
                    default:
                        toast("An error occurred", toast_JSON.error);
                }
            })
            .catch(() => toast("An error occurred", toast_JSON.error));
        }
    }, [jsonSegmentFront1, jsonSegmentFront2, jsonSegmentSide, posenetPose, pxLength]);

    useEffect(() => {
        helpers.checkComponent();
        mountedRef.current = true;
        let cancelled = false;

        const response = prompt("Enter your height in cm");
        const height = response === null ? NaN : Number(response.trim().replace(",", "."));
        if (!Number.isFinite(height) || height <= 0 || height > 250) {
            navigate("/panel");
        } else {
            setHumanHeight(height);
            runTensorflow(() => cancelled).catch(() => {
                if (!cancelled) toast("An error occurred", toast_JSON.error);
            });
        }

        return () => {
            cancelled = true;
            mountedRef.current = false;
            acquisitionAbortRef.current?.abort();
            if (detectionIntervalRef.current !== null) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
            }
            poseNetRef.current?.dispose?.();
            poseNetRef.current = null;
        };
    }, [runTensorflow, navigate]);

    const handleRefreshPage = () => {
        window.location.reload();
    }

    const handleInfo = () => {
        toast("H = Height\nS = Shoulders\nB = Bust\nC = Chest\nBE = Belly\nP = Pelvis\nG = Gluteus\nA = Arm\nL = Leg", toast_JSON.measurements);
    }

    const handleSoundFinished = () => {
        setIsSoundPlaying(false);
    }

    return (
        <div className="HumanAcquisitionContainer">
            <div id="photo-container">
                <Webcam
                    ref={ webcamRef }
                    style={{
                        width: resolutionWidth,
                        height: resolutionHeight
                    }}
                />

                <canvas
                    ref={ canvasBodyPixRef }
                    style={{
                        width: resolutionWidth,
                        height: resolutionHeight,
                        zIndex: 10
                    }}
                />

                <canvas
                    ref={ canvasRef }
                    style={{
                        width: resolutionWidth,
                        height: resolutionHeight
                    }}
                />
            </div>

            {
                countdown
                &&
                <h1 id="h1-countdown">{ countdown }</h1>
            }

            {
                acquisitionNumber < 4
                &&
                !isPaused
                &&
                <img id="button-take-photo" src={"./images/circle" + acquisitionNumber + ".png"} onClick={ handleTakePhoto } alt="Take" />
            }

            {
                ((acquisitionNumber === 1 && !isPaused) || (acquisitionNumber < 4 && isPaused))
                &&
                <img id="human-hint" src={"./images/human" + acquisitionNumber + ".png"} alt="Human hint" />
            }

            <span id="text-hint">Stand yourself <strong id="hint1">exactly as in the pictures</strong> and <strong id="hint2">remain still</strong> until you hear the <strong>shutter sound</strong>.</span>

            {
                humanAcquisitionFinalResults
                &&
                popupVisibility
                &&
                <HumanAcquisitionManageResults
                    setPopupVisibility={ setPopupVisibility }
                    humanHeight={ humanHeight }
                    humanAcquisitionPx={ humanAcquisitionPx }
                    humanAcquisitionFinalResults={ humanAcquisitionFinalResults }
                />
            }

            <h3>Desktop-only feature</h3>

            <Link to="/panel">CONTROL PANEL</Link>
            <Link id="refresh-button" onClick={ handleRefreshPage }>REFRESH</Link>
            <Link id="info-button" onClick={ handleInfo }>INFO</Link>

            <Sound
                url="./sounds/camera.mp3"
                playStatus={ isSoundPlaying ? Sound.status.PLAYING : Sound.status.STOPPED }
                onFinishedPlaying={ handleSoundFinished }
            />
        </div>
    );
}

export default HumanAcquisition;