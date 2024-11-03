import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Create a radial gradient texture for the ground
const textureSize = 1024;
const canvas = document.createElement('canvas');
canvas.width = textureSize;
canvas.height = textureSize;
const context = canvas.getContext('2d');

// Create radial gradient
const gradient = context.createRadialGradient(
  textureSize / 2, textureSize / 2, 0,
  textureSize / 2, textureSize / 2, textureSize / 2
);
gradient.addColorStop(0, '#444444');    // Light gray in the center
gradient.addColorStop(0.5, '#222222');  // Darker gray midway
gradient.addColorStop(1, '#000000');    // Black at the edges

context.fillStyle = gradient;
context.fillRect(0, 0, textureSize, textureSize);

const groundTexture = new THREE.CanvasTexture(canvas);
groundTexture.wrapS = THREE.ClampToEdgeWrapping;
groundTexture.wrapT = THREE.ClampToEdgeWrapping;

// Create larger ground for better effect
const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTexture,
  roughness: 0.8,
  metalness: 0.2,
  side: THREE.DoubleSide
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Add subtle ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

// Main spotlight for dramatic lighting
const mainSpotLight = new THREE.SpotLight(0xffffff, 500);
mainSpotLight.position.set(5, 15, 5);
mainSpotLight.angle = 0.4;
mainSpotLight.penumbra = 0.8;
mainSpotLight.decay = 1;
mainSpotLight.distance = 50;
mainSpotLight.castShadow = true;
mainSpotLight.shadow.mapSize.width = 2048;
mainSpotLight.shadow.mapSize.height = 2048;
mainSpotLight.shadow.bias = -0.0001;
scene.add(mainSpotLight);

// Add fill light for subtle details
const fillLight = new THREE.SpotLight(0xffffff, 50);
fillLight.position.set(-5, 10, -5);
fillLight.angle = 0.5;
fillLight.penumbra = 1;
fillLight.decay = 1.5;
fillLight.distance = 40;
fillLight.castShadow = true;
scene.add(fillLight);

// Add right side rim light
const rightRimLight = new THREE.SpotLight(0xffffff, 80);
rightRimLight.position.set(8, 8, 0);
rightRimLight.angle = 0.4;
rightRimLight.penumbra = 1;
rightRimLight.decay = 1.5;
rightRimLight.distance = 35;
rightRimLight.castShadow = true;
scene.add(rightRimLight);

// Add left side rim light
const leftRimLight = new THREE.SpotLight(0xffffff, 80);
leftRimLight.position.set(-8, 8, 0);
leftRimLight.angle = 0.4;
leftRimLight.penumbra = 1;
leftRimLight.decay = 1.5;
leftRimLight.distance = 35;
leftRimLight.castShadow = true;
scene.add(leftRimLight);

// Add front light
const frontLight = new THREE.SpotLight(0xffffff, 60);
frontLight.position.set(0, 6, 10);  // Positioned in front
frontLight.angle = 0.4;
frontLight.penumbra = 1;
frontLight.decay = 1.5;
frontLight.distance = 30;
frontLight.castShadow = true;
scene.add(frontLight);

// Add back light
const backLight = new THREE.SpotLight(0xffffff, 70);
backLight.position.set(0, 4.3, -10);  // Positioned behind
backLight.angle = 0.4;
backLight.penumbra = 1;
backLight.decay = 1.5;
backLight.distance = 30;
backLight.castShadow = true;
scene.add(backLight);

// Add a subtle front-bottom light for grill and bumper details
const frontBottomLight = new THREE.SpotLight(0xffffff, 40);
frontBottomLight.position.set(0, 2, 8);
frontBottomLight.angle = 0.3;
frontBottomLight.penumbra = 1;
frontBottomLight.decay = 2;
frontBottomLight.distance = 20;
frontBottomLight.castShadow = true;
scene.add(frontBottomLight);

// Set darker background color
renderer.setClearColor(0x000000);

// Adjust fog for depth effect
scene.fog = new THREE.Fog(0x000000, 20, 40);

// Update camera position for better dramatic angle
camera.position.set(8, 4, 8);
controls.update();

let carMaterials = [];

// Function to update car color
function updateCarColor(color) {
    carMaterials.forEach(material => {
        // Convert hex to RGB
        const r = ((color >> 16) & 255) / 255;
        const g = ((color >> 8) & 255) / 255;
        const b = (color & 255) / 255;

        // Update material properties
        material.color.setRGB(r, g, b);
        material.metalness = 0.6;  // Increased metalness for better reflection
        material.roughness = 0.3;
        
        // If it's a MeshStandardMaterial, you can also set emissive
        if (material.emissive) {
            material.emissive.setRGB(r * 0.2, g * 0.2, b * 0.2);
        }

        // Force material update
        material.needsUpdate = true;
    });
}

// Replace the existing getDominantColor function with this new implementation
function getDominantColor(video, canvas, ctx) {
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the ROI dimensions (matching Python implementation)
    const roiX = 150;
    const roiY = 100;
    const roiWidth = 300;
    const roiHeight = 300;
    
    // Get image data from the ROI
    const imageData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
    const pixels = imageData.data;
    
    // Calculate average RGB
    let totalR = 0, totalG = 0, totalB = 0;
    const numPixels = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
        totalR += pixels[i];
        totalG += pixels[i + 1];
        totalB += pixels[i + 2];
    }
    
    let avgR = totalR / numPixels;
    let avgG = totalG / numPixels;
    let avgB = totalB / numPixels;
    
    // Convert to HSV for enhancement
    const hsv = RGBtoHSV(avgR, avgG, avgB);
    
    // Enhance saturation and value for more intense colors
    hsv.s = Math.min(1, hsv.s * 2.5);     // Increased saturation multiplier
    hsv.v = Math.min(1, hsv.v * 1.2);     // Increased brightness
    
    // Convert back to RGB
    const enhancedRGB = HSVtoRGB(hsv.h, hsv.s, hsv.v);
    
    // Apply additional intensity enhancement
    const intensityFactor = 1.5;  // Increased from 1.2 to 1.5
    enhancedRGB.r = Math.min(255, Math.round(enhancedRGB.r * intensityFactor));
    enhancedRGB.g = Math.min(255, Math.round(enhancedRGB.g * intensityFactor));
    enhancedRGB.b = Math.min(255, Math.round(enhancedRGB.b * intensityFactor));
    
    // Convert to hex color
    const colorHex = (enhancedRGB.r << 16) | (enhancedRGB.g << 8) | enhancedRGB.b;
    
    // Draw the detection rectangle
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(roiX, roiY, roiWidth, roiHeight);
    
    return colorHex;
}

// Add RGB to HSV conversion
function RGBtoHSV(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;
    
    if (diff !== 0) {
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h /= 6;
    }
    
    return { h, s, v };
}

// Modify HSVtoRGB to return RGB object
function HSVtoRGB(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Modify the initializeWebcam function
function initializeWebcam() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 320;
    canvas.height = 240;

    // First check if webcam is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("WebRTC is not supported by your browser");
        return;
    }

    // Request webcam with more specific constraints
    const constraints = {
        video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
        },
        audio: false
    };

    // Try to access the webcam
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            console.log("Webcam access granted");
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play()
                    .then(() => {
                        console.log("Video playback started");
                        // Start color detection only after video is playing
                        startColorDetection(video, canvas, ctx);
                    })
                    .catch(err => {
                        console.error("Error playing video:", err);
                    });
            };
        })
        .catch(function(err) {
            console.error("Error accessing webcam:", err);
            alert("Error accessing webcam. Please make sure you've granted camera permissions.");
        });
}

// Separate function for color detection
function startColorDetection(video, canvas, ctx) {
    console.log("Starting color detection");
    setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            try {
                const color = getDominantColor(video, canvas, ctx);
                console.log('Detected color hex:', color.toString(16));
                
                updateCarColor(color);
                document.getElementById('detectedColor').textContent = 
                    '#' + color.toString(16).padStart(6, '0');
            } catch (e) {
                console.error('Error processing video frame:', e);
            }
        }
    }, 100);
}

// Add a loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
    console.log(`Loading file: ${url}`);
    console.log(`Loading progress: ${(loaded / total * 100)}%`);
};

loadingManager.onError = (url) => {
    console.error(`Error loading ${url}`);
};

const loader = new GLTFLoader(loadingManager).setPath('public/lambo/');
loader.load('scene.gltf', (gltf) => {
    console.log('Model loaded successfully:', gltf);
    const mesh = gltf.scene;

    mesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // More robust material detection
            if (child.material && 
                (child.material.name.toLowerCase().includes('body') || 
                 child.name.toLowerCase().includes('body') || 
                 child.name.toLowerCase().includes('car'))) {
                
                // If it's a complex material (MeshStandardMaterial), clone it
                if (child.material.isMeshStandardMaterial) {
                    const carMaterial = child.material.clone();
                    child.material = carMaterial;
                    carMaterials.push(carMaterial);
                } else {
                    carMaterials.push(child.material);
                }
                
                console.log('Found car material:', child.name, child.material);
            }
        }
    });

    mesh.scale.set(1.5, 1.5, 1.5);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, Math.PI, 0);
    scene.add(mesh);

    document.getElementById('loading').style.display = 'none';
    
    // Initialize webcam immediately after model loads
    console.log("Initializing webcam...");
    initializeWebcam();
},
(xhr) => {
    console.log(`Loading model... ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
}, 
(error) => {
    console.error('Error loading model:', error);
    document.getElementById('loading').textContent = 'Error loading model';
});

// Add OpenCV ready callback to window
window.onOpenCvReady = function() {
    console.log('OpenCV.js is ready');
    // The webcam will be initialized after the model loads
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Add environment map for better reflections
const envMapTexture = new THREE.CubeTextureLoader()
    .setPath('https://threejs.org/examples/textures/cube/SwedishRoyalCastle/')
    .load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
    ]);
scene.environment = envMapTexture;