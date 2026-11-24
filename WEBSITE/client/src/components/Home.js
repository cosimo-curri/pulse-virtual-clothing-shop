import "../styles/Home.css";

import helpers from "../helpers";
import { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

function Home() {
    const [show, setShow] = useState(false);
    const fadeIn = useSpring({
        opacity: show ? 1 : 0,
        from: { opacity: 0 },
        config: { duration: 1000 }
    });

    useEffect(() => {
        helpers.checkComponent();
        const textBehind = document.getElementById("text-behind");
        const textFront = document.getElementById("text-front");
        const textBehindBlur = document.getElementById("text-behind-blur");
        const canvasRect = document.getElementById("canvas");
        if (!canvasRect || !textBehind || !textFront || !textBehindBlur) return;

        let disposed = false;
        let frameId;
        let currentScroll = 0;
        let targetScroll = window.scrollY;
        let theta1 = 0;

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRect, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x11151c, 0.15);
        const group = new THREE.Group();
        scene.add(group);

        const pointlight = new THREE.PointLight(0x85ccb8, 7.5, 20);
        const pointlight2 = new THREE.PointLight(0x9f85cc, 7.5, 20);
        group.add(pointlight, pointlight2);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10;
        group.add(camera);

        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.5, envMapIntensity: 10 });
        const hdrTexture = new RGBELoader().setPath("./assets/").load("buddha_gradient.hdr", (texture) => {
            if (disposed) { texture.dispose(); return; }
            texture.mapping = THREE.EquirectangularReflectionMapping;
        });
        scene.environment = hdrTexture;

        let loadedObject;
        new OBJLoader().load("./assets/buddha.obj", (object) => {
            if (disposed) {
                object.traverse((child) => { if (child.isMesh) child.geometry.dispose(); });
                return;
            }
            const scale = window.innerWidth <= 600 ? 10 : 20;
            object.traverse((child) => { if (child.isMesh) child.material = material; });
            object.scale.setScalar(scale);
            object.position.set(0, -0.5, 0);
            group.add(object);
            loadedObject = object;
            setShow(true);
        });

        const onScroll = () => { targetScroll = window.scrollY; };
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        const animate = () => {
            if (disposed) return;
            const rect = canvasRect.getBoundingClientRect();
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                currentScroll += (targetScroll - currentScroll) * 0.001;
                const textScale = 1 + currentScroll * 0.0005;
                const canvasScale = 1 + currentScroll * 0.00025;
                textBehind.style.transform = `scale(${textScale})`;
                textFront.style.transform = `scale(${textScale})`;
                textBehindBlur.style.transform = `scale(${textScale})`;
                canvasRect.style.transform = `scale(${canvasScale})`;
                theta1 += currentScroll * 0.0000001;
            }
            theta1 += 0.0025;
            camera.position.set(Math.sin(theta1) * 10, Math.cos(theta1), Math.cos(theta1) * 10);
            pointlight.position.set(Math.sin(theta1 + 1) * 11, 2 * Math.cos(theta1 - 3) + 3, Math.cos(theta1 + 1) * 11);
            pointlight2.position.set(-Math.sin(theta1 + 1) * 11, -2 * Math.cos(theta1 - 3) - 6, -Math.cos(theta1 + 1) * 11);
            group.rotation.y += 0.01;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);

        return () => {
            disposed = true;
            cancelAnimationFrame(frameId);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (loadedObject) loadedObject.traverse((child) => { if (child.isMesh) child.geometry.dispose(); });
            material.dispose();
            hdrTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="HomeContainer">
            <animated.div style={fadeIn}>
                <div className="headline-container">
                    <div id="text-behind">pulse.</div>
                    <div id="text-behind-blur">pulse.</div>
                    <div id="text-front">pulse.</div>
                </div>
                <div className="canvas-container"><canvas id="canvas"></canvas></div>
            </animated.div>
            <Link to="/signin">SIGN IN</Link>
            <Link id="signup-button" to="/signup">SIGN UP</Link>
        </div>
    );
}

export default Home;
