import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { MtlObjBridge } from "three/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js";
//import { Stats } from 'stats.js/build/stats.min.js';
//javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='http://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
javascript:(function(){
  var script=document.createElement('script');
  script.onload=function(){var stats=new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop(){
      stats.update();
      requestAnimationFrame(loop)});
    };
    script.src='http://mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
  })()

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

//var stats=new Stats();
//document.body.appendChild(stats.dom);
var scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);
var controls = new OrbitControls( camera, renderer.domElement );

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
})
//var stats = new Stats();
//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild( stats.dom );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var render = function() {
  //stats.begin();
  // -----------draw-------------
  //luna.rotation.x = mouse.x;
  //var luna = scene.getObjectByName('luna');
  //luna.rotation.x += 5
	//stats.end();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// ----------setup-------------

let modelName = 'luna';

let objLoader2 = new OBJLoader2();
let callbackOnLoad = function ( object3d ) {
  object3d.name = 'luna';
  scene.add( object3d );
  console.log( 'Loading complete: ' + modelName );
};

let onLoadMtl = function ( mtlParseResult ) {
  objLoader2.setModelName( modelName );
  objLoader2.setLogging( true, true );
  objLoader2.addMaterials( MtlObjBridge.addMaterialsFromMtlLoader( mtlParseResult ), true );
  objLoader2.load( 'models/LunaEsteban.obj', callbackOnLoad, null, null, null );
};
let mtlLoader = new MTLLoader();
mtlLoader.load( 'models/LunaEsteban.mtl', onLoadMtl );

/*
let arista = 2;
let grid = 100;
var geometry = new THREE.BoxGeometry(arista, arista, arista, grid, grid, grid);

var loader = new THREE.TextureLoader();


var texture = loader.load( 'maps/text/0_800_low.jpg' );
var myDisplacementMap = loader.load( 'maps/disp/0_800_low.jpg' );
*/
/*
// varios materiales para las 6 caras
// funciona, pero un lio la rotada y la organizada?
// mejor planos separados o mejor cambiar las fotos
// AQUI VOY 
var materials = [];
var i;
for(i = 0; i < 6; i++) {
  var textura = loader.load( 'maps/text/' + i + '_800_low.jpg' );
  var relieve = loader.load( 'maps/disp/' + i + '_800_low.jpg' );
  var mtrl = new THREE.MeshPhongMaterial( {
    color: 0xfff9ed,
    emissive: 0xf0f0f,
    reflectivity: 0,
    shininess: 0,
    displacementMap: relieve,
    displacementScale: 0.07,
    displacementBias: -0.01
  } );
  mtrl.map = textura;
  materials.push(mtrl);
}
*/
/*
var material = new THREE.MeshPhongMaterial( {
    color: 0xfff9ed,
    emissive: 0xf0f0f,
    reflectivity: 0,
    shininess: 0,
    displacementMap: myDisplacementMap,
    displacementScale: 0.07,
    displacementBias: -0.01
} );

//material.map = texture;
var mesh = new THREE.Mesh(geometry, materials);
mesh.position.x = 0;
mesh.position.y = 2.2;
scene.add(mesh);
*/
/*
var meshX = -10;
for(var i = 0; i<15;i++) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10;
    scene.add(mesh);
    meshX+=1;
}
*/

var lightA = new THREE.PointLight(0xFFFFFF, 1, 500, 2)
lightA.position.set(25,0,0);
scene.add(lightA);
/*
var lightB = new THREE.PointLight(0xFFFFFF, 2, 1000)
lightB.position.set(-25,-25,-25);
scene.add(lightB);
*/
window.addEventListener('mousemove', onMouseMove);

// ----------------gui----------------
/*
var options = {
  side: {
      "FrontSide": THREE.FrontSide,
      "BackSide": THREE.BackSide,
      "DoubleSide": THREE.DoubleSide,
  }
}

const gui = new GUI()

const materialFolder = gui.addFolder('THREE.Material')
materialFolder.add(materials[0], 'transparent')
materialFolder.add(materials[0], 'opacity', 0, 1, 0.01)
materialFolder.add(materials[0], 'depthTest')
materialFolder.add(materials[0], 'depthWrite')
materialFolder.add(materials[0], 'alphaTest', 0, 1, 0.01).onChange(() => updateMaterial())
materialFolder.add(materials[0], 'visible')
materialFolder.add(materials[0], 'side', options.side).onChange(() => updateMaterial())

var data = {
  color: materials[0].color.getHex(),
  emissive: materials[0].emissive.getHex(),
  specular: materials[0].specular.getHex()
};

var meshPhongMaterialFolder = gui.addFolder('THREE.meshPhongMaterialFolder');

meshPhongMaterialFolder.addColor(data, 'color').onChange(() => { materials[0].color.setHex(Number(data.color.toString().replace('#', '0x'))) })
meshPhongMaterialFolder.addColor(data, 'emissive').onChange(() => { materials[0].emissive.setHex(Number(data.emissive.toString().replace('#', '0x'))) })
meshPhongMaterialFolder.addColor(data, 'specular').onChange(() => { materials[0].specular.setHex(Number(data.specular.toString().replace('#', '0x'))) });
meshPhongMaterialFolder.add(materials[0], 'shininess', 0, 1024);
meshPhongMaterialFolder.add(materials[0], 'wireframe')
meshPhongMaterialFolder.add(materials[0], 'flatShading').onChange(() => updateMaterial())
meshPhongMaterialFolder.add(materials[0], 'reflectivity', 0, 1)
meshPhongMaterialFolder.add(materials[0], 'refractionRatio', 0, 1)
meshPhongMaterialFolder.add(materials[0], 'displacementScale', -1, 1, 0.01)
meshPhongMaterialFolder.add(materials[0], 'displacementBias', -1, 1, 0.01)
meshPhongMaterialFolder.open()

var planeData = {
  width: 3.6,
  height: 1.8,
  widthSegments: 360,
  heightSegments: 180
};

const planePropertiesFolder = gui.addFolder("PlaneGeometry")
//planePropertiesFolder.add(planeData, 'width', 1, 30).onChange(regeneratePlaneGeometry)
//planePropertiesFolder.add(planeData, 'height', 1, 30).onChange(regeneratePlaneGeometry)
planePropertiesFolder.add(planeData, 'widthSegments', 1, 360).onChange(regeneratePlaneGeometry)
planePropertiesFolder.add(planeData, 'heightSegments', 1, 180).onChange(regeneratePlaneGeometry)
planePropertiesFolder.open()

function regeneratePlaneGeometry() {
  let newGeometry = new THREE.PlaneGeometry(
      planeData.width, planeData.height, planeData.widthSegments, planeData.heightSegments
  )
  plane.geometry.dispose()
  plane.geometry = newGeometry
}

function updateMaterial() {
  material.side = Number(material.side)
  material.needsUpdate = true
}

var planeData = {
    width: 3.6,
    height: 1.8,
    widthSegments: 360,
    heightSegments: 180
};
// ----- fin gui ----------------------
*/
render();


// -----------mouseEvent-------------
function onMouseMove(event) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);


  for (var i = 0; i < intersects.length; i++) {
    console.log( 'Objeto ' + intersects[i].object.children );
      //this.tl = new TimelineMax();
      //this.tl.to(intersects[i].object.scale, 1, {x: 2, ease: Expo.easeOut})
      //this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
      //this.tl.to(intersects[i].object.position, 3, {x: -2, ease: Expo.easeOut})
      //this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
  }
  
}