import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 360 })
// gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

/**
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.008,
    radius: 4,
    branches: 6,
    spin: 1.16,
    randomness: 0.06,
    randomnessPower: 3,
    insideColor: "#ff6030",
    outsideColor: "#13666c"
}

let particleGeometry = null;
let particleMaterial = null;
let particles = null;

const generateGalaxy = () => {
    // Destroy Galaxy
    if (particles) {
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.remove(particles);
    } 

    // Geometry
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const spread = parameters.randomness;
        const spinRand = 0.1

        
        const rand = Math.random();
        const theta = (i % parameters.branches) * 2 * Math.PI / parameters.branches;
        const r = rand * parameters.radius;
        const spin = r * parameters.spin;

        const spinEnd = (1-rand) * spread + (rand) * spread * Math.random() * 0.5 * (1 - rand*0.7);

        const origin = {
            // x: (Math.random() - 0.5) * spinEnd,
            // y: (Math.random() - 0.5) * spinEnd * 0.6,
            // z: (Math.random() - 0.5) * spinEnd
            x: Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1),
            y: Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * 0.5,
            z: Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1),
        }

        // positions[i3 + 0] = r * Math.cos(theta + spin) + (1-rand) * origin.x;
        positions[i3 + 0] = r * Math.cos(theta + spin) + origin.x;
        // positions[i3 + 1] = (1-rand) * origin.y;
        positions[i3 + 1] = origin.y;
        // positions[i3 + 2] = r * Math.sin(theta + spin) + (1-rand) * origin.z;       
        positions[i3 + 2] = r * Math.sin(theta + spin) + origin.z;       

        let newColors = [1, 1, 1];
        const colorPick = Math.floor(Math.random() * 4);

        if (colorPick == 1) {
            newColors = [0.827, 0.106, 1]
        } else if (colorPick == 2) {
            newColors = [0.129, 0.141, 0.369]
        } else if (colorPick == 3) {
            newColors = [0.984, 1, 0.42]
        }

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, r / parameters.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
        
        
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xffffff,
        vertexColors: true
    });

    // Points
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

generateGalaxy();

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 0
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    particles.rotation.y = -elapsedTime * 0.05;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()