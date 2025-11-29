import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

const viewCanvas = document.querySelector('.main-view');

// set up controls
const controls = new OrbitControls(camera, viewCanvas);
camera.position.z = 45;
camera.position.y = 30;
controls.target.set(0, 0, 0);
controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 5;
controls.minAzimuthAngle = controls.maxAzimuthAngle = Math.PI / 4;
controls.update()

const renderer = new THREE.WebGLRenderer({canvas: viewCanvas});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );

// lights
const dirLight = new THREE.DirectionalLight( 0xffffff, 3.7);
dirLight.position.set(10, 10, 10).normalize();
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight( 0xcc22cc, 3.7);
dirLight2.position.set(-10, -10, -10).normalize();
scene.add(dirLight2);

const planeSize = 30;

const loader = new THREE.TextureLoader();
const texture = loader.load('/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = 8;
texture.repeat.set(repeats, repeats);

// create a plane geometry
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -0.5;
scene.add(mesh);

function animate() {

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  for (const avatar of Object.keys(avatarsMap)) {
    avatarsMap[avatar].touched = false;
  }

  for (const player of Object.keys(playerMap)) {
    // spawnUser(player, playerMap[player]);
    if (!Object.keys(avatarsMap).includes(player)) { 
        const avatar = spawnAvatar(player, playerMap[player]);
        avatarsMap[player] = avatar;
    } else {
        updateAvatarPosition(player, playerMap[player]);
    }
    avatarsMap[player].touched = true;
  }

  for (const avatar of Object.keys(avatarsMap)) {
    console.log(avatar, avatarsMap[avatar].touched);
    if (!(avatarsMap[avatar].touched)) { despawnAvatar(avatar); }
  }

  renderer.render( scene, camera );

}

function despawnAvatar(id) {
    scene.remove(avatarsMap[id]);
    delete avatarsMap[id];
}

function spawnAvatar(id, spawnPosition) {
    const userHeight = 4;
    const geometry = new THREE.CapsuleGeometry( 1, userHeight, 4, 8, 1 );
    const colorRandom = getRandomColor();
    const material = new THREE.MeshToonMaterial( { color: colorRandom} );
    const capsule = new THREE.Mesh( geometry, material );
    capsule.position.x = spawnPosition.x;
    capsule.position.z = spawnPosition.y;
    capsule.position.y = userHeight;
    scene.add( capsule );
    return capsule;
}

function updateAvatarPosition(id, position) {
    avatarsMap[id].position.x = position.x;
    avatarsMap[id].position.z = position.y;

}

function clearAllAvatars() {
    console.log('clearing all avatars');
}

function getRandomColor() {
    const randomColor = Math.floor(Math.random() * 16777215);
    return randomColor;
}

/* player tracking */
const avatarsMap = {};

console.log(playerMap);


/* get player target position */
const mouse = new THREE.Vector2();
function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([mesh], true);

    if (intersects.length > 0) {
        const clickedPoint = intersects[0].point;

        sendPositionsToServer(clickedPoint.x, clickedPoint.z);
    }

};

window.addEventListener('mousedown', onDocumentMouseDown, false);