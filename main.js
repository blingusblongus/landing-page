import './style.css';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, Group } from 'three';
import { throttle } from 'lodash-es';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


let aspectRatio = window.innerWidth / window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
const resizeUpdateInterval = 1000;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = Math.pow(1.1, 4.0 );

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .9, .01, .3);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
composer.addPass(bloomPass);

const loader = new GLTFLoader();
let pig, text, newPig;
let loaded;
const pigGroup = new THREE.Group();

loader.load('./assets/Pig.glb', function (gltf) {
  pig = gltf.scene;

  let meshes = [];
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.translateY(-40)
    }
  });

  pig.scale.set(2, 2, 2);

  for (let i = 0; i < 30; i++) {
    newPig = pig.clone(true);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(50));
    newPig.position.set(x / 2, y * 3 + 80, z);
    newPig.rotation.set(x, y, z);
    pigGroup.add(newPig);

  }
  scene.add(pigGroup);

}, undefined, function (err) {
  console.error(err);
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio = window.devicePixelRatio;
composer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

loader.load('./assets/NICKALLENTEXT2.glb', function (gltf) {
  text = gltf.scene;

  let meshes = [];
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      console.log('material set');
      obj.material = material;
    } else {
      console.log('material not set');
      console.log(obj);
    }
  });
  text.rotation.x = Math.PI / 2;
  text.position.y = document.body.getBoundingClientRect().top * .01;
  text.scale.set(6, 6, 6)
  scene.add(text);
}, undefined, function (err) {
  console.error(err);
})

const spotlight = new THREE.SpotLight(0xffffff, 1, 5, 23, 1, 1);

scene.add(spotlight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x246347, .2);
scene.add(ambientLight);

let scaleUp = true;
const scaleSpeed = .01;

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('scroll', (e) => {
  movePig();
  moveText();
})

function moveText() {
  const t = document.body.getBoundingClientRect().top;

  text.position.y = 0 - (t * .01);
}

function movePig() {
  const t = document.body.getBoundingClientRect().top;
  console.log(t);

  pig.position.x = t * .01;
  pigGroup.position.y = t * .1;

  for (let pig of pigGroup.children) {
    pig.rotation.y = t * .01;
    pig.rotation.z = t * .01;
  }
}


///// FRAME BY FRAME ANIMATION
function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += .01;
  // loader.rotation.x += .2;
  if (pig) {
    pig.rotation.x += .05;
    pig.rotation.y += .02;
    // pig.rotation.z += .02;

    if (scaleUp) {
      pig.scale.set(pig.scale.x + scaleSpeed, pig.scale.y + scaleSpeed, pig.scale.z + scaleSpeed);
    } else {
      pig.scale.set(pig.scale.x - scaleSpeed, pig.scale.y - scaleSpeed, pig.scale.z - scaleSpeed);
    }

    if (pig.scale.x > 5) {
      scaleUp = false;
    } if (pig.scale.x < .5) {
      scaleUp = true;
    }
  }

  composer.render();
}

animate();