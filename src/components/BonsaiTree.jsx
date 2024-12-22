import React from "react";
import * as THREE from "three";
import { Tree } from "../services/tree";

function BonsaiTree() {
  const canvasRef = React.useRef();

  // Memoized Tree Object
  const tree = React.useMemo(() => {
    const newTree = new Tree();
    newTree.generate();
    newTree.position.set(0, -10, 0);
    newTree.scale.set(0.65, 0.65, 0.65);
    return newTree;
  }, []);

  // Memoized Scene and Camera Setup
  const { scene, camera, renderer } = React.useMemo(() => {
    const rendererInstance = new THREE.WebGLRenderer({
      antialias: true,
    });
    rendererInstance.shadowMap.enabled = true;
    rendererInstance.shadowMap.type = THREE.PCFSoftShadowMap;

    const sceneInstance = new THREE.Scene();
    const cameraInstance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraInstance.position.set(0, 5, 30);
    cameraInstance.lookAt(0, 0, 0);

    return {
      scene: sceneInstance,
      camera: cameraInstance,
      renderer: rendererInstance,
    };
  }, []);

  const render = React.useCallback(() => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }, [camera, renderer, scene]);

  // Add Lights and Tree to Scene
  React.useEffect(() => {
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Background
    scene.background = new THREE.Color(0x87ceeb);

    // Add Tree
    scene.add(tree);

    // Renderer Setup
    if (canvasRef.current) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      canvasRef.current.appendChild(renderer.domElement);
    }

    render();

    // Cleanup
    return () => {
      renderer.dispose();
    };
  }, [scene, camera, renderer, tree, render]);

  // Handle Window Resizing
  React.useEffect(() => {
    const resizeRenderer = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resizeRenderer);

    return () => {
      window.removeEventListener("resize", resizeRenderer);
    };
  }, [camera, renderer]);

  return <div ref={canvasRef} />;
}

export default React.memo(BonsaiTree);
