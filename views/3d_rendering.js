import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

const viewCanvas = document.querySelector('.main-view');

/* fix wonky aspect ratio */
const targetAspect = 16 / 9;
let width = window.innerWidth;
let height = window.innerHeight;
const aspect = width / height;

if (aspect > targetAspect) {
    width = height * targetAspect;
} else {
    height = width / targetAspect;
}

// set up controls
const controls = new OrbitControls(camera, viewCanvas);
camera.position.z = 45;
camera.position.y = 30;
camera.aspect = width / height;
controls.target.set(0, 0, 0);
controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 5;
controls.minAzimuthAngle = controls.maxAzimuthAngle = Math.PI / 4;
controls.update()

const renderer = new THREE.WebGLRenderer({canvas: viewCanvas});
renderer.setSize( width,  height );
renderer.setAnimationLoop( animate );

// lights
const dirLight = new THREE.DirectionalLight( 0xffffff, 3.7);
dirLight.position.set(10, 10, 10).normalize();
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight( 0xcc22cc, 3.7);
dirLight2.position.set(-10, 10, -10).normalize();
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
        let self = playerMap[player].self;
        const avatar = spawnAvatar(player, playerMap[player], self, playerMap[player].color);
        avatarsMap[player] = avatar;
    } else {
        updateAvatarPosition(player, playerMap[player]);
    }
    avatarsMap[player].touched = true;
  }

  for (const avatar of Object.keys(avatarsMap)) {
    if (!(avatarsMap[avatar].touched)) { despawnAvatar(avatar); }
  }

  renderer.render( scene, camera );

}

function despawnAvatar(id) {
    scene.remove(avatarsMap[id]);
    document.body.removeChild(avatarsMap[id].nameLabel);
    delete avatarsMap[id];
}

function spawnAvatar(id, spawnPosition, self, color) {
    const userHeight = 4;
    const geometry = new THREE.CapsuleGeometry( 1, userHeight, 4, 8, 1 );
    const colorRandom = getRandomColor();
    const material = new THREE.MeshToonMaterial( { color: color ?? colorRandom} );
    const capsule = new THREE.Mesh( geometry, material );
    capsule.position.x = spawnPosition.x;
    capsule.position.z = spawnPosition.y;
    capsule.position.y = userHeight;
    scene.add( capsule );

    /* give the player some eyes */
    
    addEyes(capsule);

    if (self) {
        /* add indicator that this is the player */
        const geometry = new THREE.ConeGeometry(0.5, .5, 3);
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        const indicator = new THREE.Mesh(geometry, material);

        indicator.position.y = 7;
        indicator.rotation.x = Math.PI;

        capsule.add(indicator);
    }

    /* add a name label */
    const nameLabel = document.createElement('div');
    nameLabel.innerText = spawnPosition._display_name ?? id;

    /* add name label at absolute screen position*/
    camera.updateMatrixWorld();
    const pos = capsule.position.clone();
    pos.project(camera);

    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    console.log(pos);

    setNameLabelStyle(nameLabel, self);


    nameLabel.style.left = `${x - 45}px`;
    nameLabel.style.top  = `${y - 80}px`;

    document.body.appendChild(nameLabel);
    capsule.nameLabel = nameLabel;
    capsule._display_name = spawnPosition._display_name;

    return capsule;
}

function setNameLabelStyle(nameLabel, self) {
    nameLabel.style.pointerEvents = 'none';
    nameLabel.style.position = 'absolute';
    nameLabel.style.backgroundColor = '#00000099';
    nameLabel.style.color = self ? 'yellow' : 'white';
    nameLabel.style.padding = '5px';
    nameLabel.style.fontWeight = "bold";
    nameLabel.style.fontFamily = "arial";
    nameLabel.style.zIndex = '20';
}

function addEyes(capsule) {
    


    const lEye = createEyeGeom();
    lEye.rotation.z = Math.PI / 2;
    lEye.position.x = 0.5;
    lEye.position.z = 0.3;
    lEye.position.y = 1.8;

    const rEye = createEyeGeom();
    rEye.rotation.z = Math.PI / 2;
    rEye.position.x = 0.5;
    rEye.position.z = -0.3;
    rEye.position.y = 1.8;

    capsule.add(lEye);
    capsule.add(rEye);
}

function createEyeGeom() {
    const eyeGeometry = new THREE.CylinderGeometry(.2, .2, .8);
    const eyeColor = 0x000000;
    const eyeMaterial = new THREE.MeshToonMaterial( { color: eyeColor } );
    const lEye = new THREE.Mesh( eyeGeometry, eyeMaterial);
    return lEye;
}

function updateLabelPosition(avatar, curName) {
    const nameLabel = avatar.nameLabel;
    // console.log(avatar);
    if (curName) nameLabel.innerText = curName;
    camera.updateMatrixWorld();
    const pos = avatar.position.clone();
    pos.project(camera);

    const x = (pos.x *  0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    nameLabel.style.left = `${x - 45}px`;
    nameLabel.style.top  = `${y - 80}px`;
}

function updateAvatarPosition(id, position) {

    const dx = position.x - avatarsMap[id].position.x;
    const dz = position.y - avatarsMap[id].position.z;

    if (dx !== 0 || dz !== 0) {
        avatarsMap[id].rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
    }

    avatarsMap[id].position.x = position.x;
    avatarsMap[id].position.z = position.y;

    updateLabelPosition(avatarsMap[id], position._display_name);
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
    if (event.button === 2) { return; } /* this is a right click */
    event.preventDefault();
    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([mesh], true);

    if (intersects.length > 0) {
        const clickedPoint = intersects[0].point;

        spawnMoveMarker(clickedPoint);

        sendPositionsToServer(clickedPoint.x, clickedPoint.z);
    }

};

function spawnMoveMarker(point) {

    /* create new mesh -- 4 horizontal triangles pointing at the clicked point */
    const geometry = new THREE.CircleGeometry(0.5, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xcc2283});
    const marker = new THREE.Mesh(geometry, material);

    /* add mesh to scene */
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(point.x, 0.1, point.z);
    scene.add(marker);

    /* destroy after 2 seconds */
    setTimeout(() => {
        scene.remove(marker);
        geometry.dispose();
        material.dispose();
    }, 300);
}

window.addEventListener('mousedown', onDocumentMouseDown, false);