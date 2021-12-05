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
const pigGroup = new THREE.Group();

// Load pigs and randomize instances
loader.load('./assets/Pig.glb', function (gltf) {
  pig = gltf.scene;
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

// Load NAMETEXT
loader.load('./assets/NICKALLENTEXT2.glb', function (gltf) {
  text = gltf.scene;
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

// Config renderer and composer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio = window.devicePixelRatio;
composer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera);

// Torus
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

/* LIGHTS */
// POINT LIGHT
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// AMBIENT LIGHT
const ambientLight = new THREE.AmbientLight(0xffdfff, .3);
scene.add(ambientLight);

/* LISTENERs */
// Resize handling
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

}

// Scroll functions
window.addEventListener('scroll', (e) => {
  movePig();
  moveText();
})

// NAME scroll handling
function moveText() {
  const t = document.body.getBoundingClientRect().top;
  text.position.y = 0 - (t * .01);
}

// PIG scroll handling
function movePig() {
  const t = document.body.getBoundingClientRect().top;

  pig.position.x = t * .01;
  pigGroup.position.y = t * .1;

  for (let pig of pigGroup.children) {
    pig.rotation.y = t * .01;
    pig.rotation.z = t * .01;
  }
}

// // create the plane mesh
// var planeMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
// var planeGeometry = new THREE.PlaneGeometry();
// var planeMesh= new THREE.Mesh( planeGeometry, planeMaterial );
// // add it to the WebGL scene
// scene.add(planeMesh);

// // create the dom Element
// var element = document.createElement( 'img' );
// element.src = 'textures/sprites/ball.png';
// // create the object3d for this element
// var cssObject = new THREE.CSS3DObject( element );
// // we reference the same position and rotation 
// cssObject.position = planeMesh.position;
// cssObject.rotation = planeMesh.rotation;
// // add it to the css scene
// scene.add(cssObject);

///// FRAME BY FRAME ANIMATION
function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += .01;
  // loader.rotation.x += .2;
  if (pig) {
    pig.rotation.x += .05;
    pig.rotation.y += .02;
    // pig.rotation.z += .02;

  //   if (scaleUp) {
  //     pig.scale.set(pig.scale.x + scaleSpeed, pig.scale.y + scaleSpeed, pig.scale.z + scaleSpeed);
  //   } else {
  //     pig.scale.set(pig.scale.x - scaleSpeed, pig.scale.y - scaleSpeed, pig.scale.z - scaleSpeed);
  //   }

  //   if (pig.scale.x > 5) {
  //     scaleUp = false;
  //   } if (pig.scale.x < .5) {
  //     scaleUp = true;
  //   }
  }

  composer.render();
}

animate();