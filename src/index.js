import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module.js';
//import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as L from '../logic'
import * as U from '../logic/utils'

//var labelRenderer
/*

*/

// cubo setup
/*
const COLOUR_TABLE = {
  'U': new THREE.Color('blue'),
  'D': new THREE.Color('green'),
  'L': new THREE.Color('red'),
  'R': new THREE.Color('darkorange'),
  'F': new THREE.Color('yellow'),
  'B': new THREE.Color('ghostwhite'),
  '-': new THREE.Color(0x101010)
}
*/

const CUBE_SIZE = 3
const SPEED_MILLISECONDS = 750
const NUM_RANDOM_MOVES = 1
const DELAY_MS = 1000

const globals = {
  cube: undefined,
  renderer: undefined,
  camera: undefined,
  scene: undefined,
  puzzleGroup: undefined,
  animationGroup: undefined,
  controls: undefined,
  clock: undefined,
  animationMixer: undefined,
  cuboClick: undefined,
  texturas: undefined
}

const makeRotationMatrix4 = rotationMatrix3 => {
  const n11 = rotationMatrix3.get([0, 0])
  const n12 = rotationMatrix3.get([1, 0])
  const n13 = rotationMatrix3.get([2, 0])
  const n21 = rotationMatrix3.get([0, 1])
  const n22 = rotationMatrix3.get([1, 1])
  const n23 = rotationMatrix3.get([2, 1])
  const n31 = rotationMatrix3.get([0, 2])
  const n32 = rotationMatrix3.get([1, 2])
  const n33 = rotationMatrix3.get([2, 2])
  return new THREE.Matrix4().set(
    n11, n12, n13, 0,
    n21, n22, n23, 0,
    n31, n32, n33, 0,
    0, 0, 0, 1)
}

const loadGeometry = url =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      gltf => {
        const bufferGeometry = gltf.scene.children[0].geometry
        const geometry = new THREE.Geometry()
        geometry.fromBufferGeometry(bufferGeometry)
        resolve(geometry)
      },
      undefined,
      reject)
  })

const createUiPieces = (cube, pieceGeometry) => {
  globals.texturas = []
  var i;
  for (i=0; i < 6; i++) {
    globals.texturas[i] = new THREE.TextureLoader().load( 'maps/tierra/' + i + '_800_low.jpg' );
  }
  cube.forEach(piece => {
    const uiPiece = createUiPiece(piece, pieceGeometry)
    //console.log(uiPiece.children[1].name)
    globals.puzzleGroup.add(uiPiece)
  })
}

const createUiPiece = (piece, pieceGeometry) => {
  // CAMBIOS RADICALES ***********
  const pieceGeometryWithColors = pieceGeometry.clone()
  const materialFicha = new THREE.MeshPhysicalMaterial({
    color: 0x101010,
    metalness: 0,
    roughness: 0,
    clearcoat: 1,
    reflectivity: 1
  })
  const uiPiece = new THREE.Group()
  const marcoFicha = new THREE.Mesh(pieceGeometryWithColors, materialFicha)
  marcoFicha.scale.set(0.5, 0.5, 0.5)
  marcoFicha.name = 'marcoFicha'
  uiPiece.add(marcoFicha) // uiPiece antes era un mesh, ahora seria un grpo ue contien unos meshes
  uiPiece.userData = piece.id
  uiPiece.name = 'Ficha'
  resetUiPiece(uiPiece, piece)
  //console.log(uiPiece.userData)
  //console.log(uiPiece.position)

  var textureSize = 800
  var sumAbs = Math.abs(uiPiece.position.x) + Math.abs(uiPiece.position.y) + Math.abs(uiPiece.position.z);

  //for (var i=0; i < sumAbs; i++){
  // todas las fichas tienen al menos una cara
  var cualCara
  if (uiPiece.position.z == 1) cualCara = 0;
  else if (uiPiece.position.x == 1) cualCara = 1;
  else if (uiPiece.position.x == -1) cualCara = 2;
  else if (uiPiece.position.z == -1) cualCara = 3;
  else if (uiPiece.position.y == -1) cualCara = 4;
  else if (uiPiece.position.y == 1) cualCara = 5;

  var data = new Uint8Array( textureSize * textureSize * 3 );
  var textura = new THREE.DataTexture( data, textureSize, textureSize, THREE.RGBFormat );
  textura.minFilter = THREE.NearestFilter;
  textura.magFilter = THREE.NearestFilter;
  textura.needsUpdate = true;
  data.fill(255)
  //.log(data);

  var planoA = new THREE.PlaneBufferGeometry( 0.86, 0.86 );
  var materialA = new THREE.MeshPhysicalMaterial( {color: 0xffffff, side: THREE.FrontSide, metalness: 0,
  roughness: 0, clearcoat: 1, reflectivity: 1, map: textura} );
  var meshA = new THREE.Mesh( planoA,  materialA);
  meshA.name = cualCara
  uiPiece.add(meshA)

  if (sumAbs > 1) {
    if (uiPiece.position.y == 1) cualCara = 5;
		else if (uiPiece.position.y == -1) cualCara = 4;
		else if (uiPiece.position.y == 0) {
			if (uiPiece.position.x == -1) cualCara = 2;
			else if (uiPiece.position.x == 1) cualCara = 1;
			if (uiPiece.position.z == -1) cualCara = 3;
    }
    var planoB = new THREE.PlaneBufferGeometry( 0.86, 0.86 );
    var materialB = new THREE.MeshPhysicalMaterial( {color: 0xffffff, side: THREE.FrontSide, metalness: 0,
      roughness: 0, clearcoat: 1, reflectivity: 1, map: textura} );
		var meshB = new THREE.Mesh( planoB,  materialB);
    meshB.name = cualCara
    uiPiece.add(meshB)
		if (sumAbs > 2) {
      if (uiPiece.position.z == -1) cualCara = 3;
			else {

				if (uiPiece.position.y == 1) {
					if (uiPiece.position.x == -1) cualCara = 2;
					else if (uiPiece.position.x == 1) cualCara = 1;
				}
				else if (uiPiece.position.y == -1) {
					if (uiPiece.position.x == -1) cualCara = 2;
					else if (uiPiece.position.x == 1) cualCara = 1;
				}
      }
      var planoC = new THREE.PlaneBufferGeometry( 0.86, 0.86 );
      var materialC = new THREE.MeshPhysicalMaterial( {color: 0xffffff, side: THREE.FrontSide, metalness: 0,
        roughness: 0, clearcoat: 1, reflectivity: 1, map: textura} );
      var meshC = new THREE.Mesh( planoC,  materialC);
      meshC.name = cualCara
      uiPiece.add(meshC)
    }
  }
  // REPOSICIONA Y REMAPEA ******************
  
  var unit = 1 / CUBE_SIZE;
  for (var u=1; u < uiPiece.children.length; u++){
    if (uiPiece.children[u].name == 0) {
      uiPiece.children[u].position.z = 0.48
      uiPiece.children[u].material.map = globals.texturas[0]
      var ox, oy;
      ox = uiPiece.position.x + 1
      oy = uiPiece.position.y + 1
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    } else if (uiPiece.children[u].name == 1) {
      uiPiece.children[u].position.x = 0.48
      uiPiece.children[u].rotation.y = Math.PI/2
      uiPiece.children[u].material.map = globals.texturas[1]
      var ox, oy;
      ox = Math.abs(uiPiece.position.z - 1)
      oy = uiPiece.position.y + 1
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    } else if (uiPiece.children[u].name == 2) {
      uiPiece.children[u].position.x = -0.48
      uiPiece.children[u].rotation.y = -Math.PI/2
      uiPiece.children[u].material.map = globals.texturas[2]
      var ox, oy;
      ox = uiPiece.position.z + 1
      oy = uiPiece.position.y + 1
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    } else if (uiPiece.children[u].name == 3) {
      uiPiece.children[u].position.z = -0.48
      uiPiece.children[u].rotation.y = Math.PI
      uiPiece.children[u].material.map = globals.texturas[3]
      var ox, oy;
      ox = Math.abs(uiPiece.position.x - 1)
      oy = uiPiece.position.y + 1
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    } else if (uiPiece.children[u].name == 4) {
      uiPiece.children[u].position.y = -0.48
      uiPiece.children[u].rotation.x = Math.PI/2
      uiPiece.children[u].material.map = globals.texturas[4]
      var ox, oy;
      ox = uiPiece.position.x + 1
      oy = uiPiece.position.z + 1
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    } else if (uiPiece.children[u].name == 5) {
      uiPiece.children[u].position.y = 0.48
      uiPiece.children[u].rotation.x = -Math.PI/2
      uiPiece.children[u].material.map = globals.texturas[5]
      var ox, oy;
      ox = uiPiece.position.x + 1
      oy = Math.abs(uiPiece.position.z - 1)
      var uvs = uiPiece.children[u].geometry.attributes.uv.array;
      for ( var n = 0; n < uvs.length; n += 2 ) {
        uvs[ n ] = ( uvs[ n ] + ox ) * unit;
        uvs[ n + 1 ] = ( uvs[ n + 1 ] + oy ) * unit;
      }
    }
  }
  return uiPiece
}

const resetUiPiece = (uiPiece, piece) => {
  const isEvenSizedCube = CUBE_SIZE % 2 === 0
  const adjustValue = v => isEvenSizedCube ? v < 0 ? v + 0.5 : v - 0.5 : v
  uiPiece.position.x = adjustValue(piece.x)
  uiPiece.position.y = adjustValue(piece.y)
  uiPiece.position.z = adjustValue(piece.z)
  uiPiece.setRotationFromMatrix(makeRotationMatrix4(piece.accTransform3))
}

const findUiPiece = piece =>
  globals.puzzleGroup.children.find(child => child.userData === piece.id)

// fin cubo ------------------

var animate = function() {
  window.requestAnimationFrame(animate)
  //if ( globals.controls.enabled ) globals.controls.update();
  const delta = globals.clock.getDelta() * globals.animationMixer.timeScale
  globals.animationMixer.update(delta)
  globals.renderer.render(globals.scene, globals.camera)
  //labelRenderer.render(globals.scene, globals.camera);
  stats.update();
  
}

const movePiecesBetweenGroups = (uiPieces, fromGroup, toGroup) => {
  if (uiPieces.length) {
    fromGroup.remove(...uiPieces)
    toGroup.add(...uiPieces)
  }
}

const createAnimationClip = move => {
  const numTurns = move.numTurns
  const t0 = 0
  const t1 = numTurns * (SPEED_MILLISECONDS / 1000)
  const times = [t0, t1]
  const values = []
  const startQuaternion = new THREE.Quaternion()
  const endQuaternion = new THREE.Quaternion()
  const rotationMatrix3 = move.rotationMatrix3
  const rotationMatrix4 = makeRotationMatrix4(rotationMatrix3)
  endQuaternion.setFromRotationMatrix(rotationMatrix4)
  startQuaternion.toArray(values, values.length)
  endQuaternion.toArray(values, values.length)
  const duration = -1
  const tracks = [new THREE.QuaternionKeyframeTrack('.quaternion', times, values)]
  return new THREE.AnimationClip(move.id, duration, tracks)
}

/*

const animateMoves = (moves, nextMoveIndex = 0) => {

  const move = moves[nextMoveIndex]

  if (!move) {
    //return setTimeout(scramble, 2000)
  }

  const pieces = L.getPieces(globals.cube, move.coordsList)
  const uiPieces = pieces.map(findUiPiece)
  movePiecesBetweenGroups(uiPieces, globals.puzzleGroup, globals.animationGroup)

  const onFinished = () => {
    globals.animationMixer.removeEventListener('finished', onFinished)
    movePiecesBetweenGroups(uiPieces, globals.animationGroup, globals.puzzleGroup)
    globals.cube = move.makeMove(globals.cube)
    const rotationMatrix3 = move.rotationMatrix3
    const rotationMatrix4 = makeRotationMatrix4(rotationMatrix3)
    for (const uiPiece of uiPieces) {
      uiPiece.applyMatrix4(rotationMatrix4)
    }
    setTimeout(animateMoves, SPEED_MILLISECONDS, moves, nextMoveIndex + 1)
  }

  globals.animationMixer.addEventListener('finished', onFinished)

  const animationClip = createAnimationClip(move)
  const clipAction = globals.animationMixer.clipAction(
    animationClip,
    globals.animationGroup)
  clipAction.setLoop(THREE.LoopOnce)
  clipAction.play()
}
*/
/*
const showSolutionByCheating = randomMoves => {
  const solutionMoves = randomMoves
    .map(move => move.oppositeMoveId)
    .map(id => L.lookupMoveId(CUBE_SIZE, id))
    .reverse()
  console.log(`solution moves: ${solutionMoves.map(move => move.id).join(' ')}`)
  console.log( solutionMoves )
  animateMoves(solutionMoves)
}
*/

let todosLosMovimientos = L.PER_CUBE_SIZE_DATA.get(CUBE_SIZE)
//console.log(todosLosMovimientos)
var movimientos =[]

let i = 0
todosLosMovimientos.moves.forEach(move => {
  //console.log('Para el move ' + move.id + ' las vueltas asignadas son ' + move.numTurns)
  if (move.numTurns == 1) movimientos.push(i)
  i++
})
//console.log(movimientos)

const muevelo = cual => {
  const cualMovimiento = movimientos[cual]
  const elMovimiento = U.range(1).map(() => L.getMovimiento(cualMovimiento))
  //L.removeRedundantMoves(elMovimiento)
  const solutionMoves = elMovimiento
    .map(move => move.oppositeMoveId)
    .map(id => L.lookupMoveId(CUBE_SIZE, id))
    .reverse()
    /*
  console.log(`MUEVE: ${solutionMoves.map(move => move.id).join(' ')}`)
  console.log( solutionMoves )
  */
  mueveUno(solutionMoves)
  girando = true
}

var raycaster = new THREE.Raycaster();
var mouseOrbit = new THREE.Vector2();
globals.cuboClick = new THREE.Vector3()

function orbitStart ( ) {
  //console.log('De orbitStart')
  mouseOrbit.x = ( globals.controls.getStartCoords().x / window.innerWidth ) * 2 - 1
  mouseOrbit.y = - ( globals.controls.getStartCoords().y / window.innerHeight ) * 2 + 1
  raycaster.setFromCamera(mouseOrbit, globals.camera);
  var intersects = raycaster.intersectObjects(globals.scene.children, true);
  if (intersects.length > 0) {
    globals.controls.enableRotate = false;
    globals.cuboClick = intersects[0].object.parent.position
  } else {
    globals.controls.enableRotate = true;
    globals.cuboClick = NaN
  }
  //console.log(mouseOrbit);
}

function orbitEnd ( ) {
  console.log('De orbitEnd')
  globals.controls.enableRotate = true;
  if (typeof globals.cuboClick.x !== 'undefined' && girando == false) {
    let mouseUp = new THREE.Vector2();
    mouseUp.x = ( globals.controls.getEndCoords().x / window.innerWidth ) * 2 - 1
    mouseUp.y = - ( globals.controls.getEndCoords().y / window.innerHeight ) * 2 + 1
    let deltaMouse = new THREE.Vector2();
    deltaMouse.x = (mouseUp.x - mouseOrbit.x) * window.innerWidth
    deltaMouse.y = (mouseUp.y - mouseOrbit.y) * window.innerHeight
    console.log('Con inicio x en ' + mouseOrbit.x + ' terminando en ' + mouseUp.x + 'deltaX = ' + deltaMouse.x)
    console.log('Con inicio y en ' + mouseOrbit.y + ' terminando en ' + mouseUp.y + 'deltaY = ' + deltaMouse.y)
    if (Math.abs(deltaMouse.x) > Math.abs(deltaMouse.y)) { // mov horizontal
      console.log('horizontal')
      if (deltaMouse.x < 0 && globals.cuboClick) { // mov a la izquierda
        if (globals.cuboClick.y == 1) muevelo(10)
        else if (globals.cuboClick.y == 0) muevelo(8)
        else if (globals.cuboClick.y == -1) muevelo(6)
      } else  { // mov a la derecha
        if (globals.cuboClick.y == 1) muevelo(11)
        else if (globals.cuboClick.y == 0) muevelo(9)
        else if (globals.cuboClick.y == -1) muevelo(7)
      }
    } 
    else if (Math.abs(deltaMouse.x) < Math.abs(deltaMouse.y)){ // mov vertical
      console.log('vertical')
      if (deltaMouse.y > 0) { // mov arriba
        if (globals.cuboClick.x == 1) muevelo(4)
        else if (globals.cuboClick.x == 0) muevelo(2)
        else if (globals.cuboClick.x == -1) muevelo(0)
      } else { // mov abajo
        if (globals.cuboClick.x == 1) muevelo(5)
        else if (globals.cuboClick.x == 0) muevelo(3)
        else if (globals.cuboClick.x == -1) muevelo(1)
      }

    }
  }
  globals.cuboClick = NaN
  console.log('end');
}

/*
function orbitChange ( ) {
  //console.log(globals.controls.getAzimuthalAngle());
  console.log(globals.controls.getAzimuthalAngle());
  console.log(globals.controls.getPolarAngle());
}
*/

const init = async () => {

  const w = window.innerWidth
  const h = window.innerHeight
  globals.renderer = new THREE.WebGLRenderer({ antialias: true })
  globals.renderer.setClearColor("#000000")
  globals.renderer.setSize(w, h)
  document.body.appendChild(globals.renderer.domElement);
/*
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );
  */  
  window.addEventListener('resize', () => {
    globals.renderer.setSize(window.innerWidth,window.innerHeight)
    //labelRenderer.setSize( window.innerWidth, window.innerHeight );
    globals.camera.aspect = window.innerWidth / window.innerHeight
    globals.camera.updateProjectionMatrix()
  })

  globals.scene = new THREE.Scene()
  globals.scene.background = new THREE.Color(0x000000)
  globals.camera = new THREE.PerspectiveCamera(34, w / h, 1, 100)
  globals.camera.position.set(0, 0, 12)
  globals.camera.lookAt(new THREE.Vector3(0, 0, 0))
  globals.scene.add(globals.camera)
  
  globals.controls = new OrbitControls(globals.camera, globals.renderer.domElement)
  globals.controls.minDistance = 2.0
  globals.controls.maxDistance = 40.0
  globals.controls.enableDamping = true
  globals.controls.dampingFactor = 0.9

  //globals.controls.addEventListener( 'pointerdown',orbitDown ,false ); //el true es para useCapture, aggarando el evento antes de la parada de propagaciones
  //globals.controls.addEventListener( 'mouseup',orbitUp ,false );
  //globals.controls.addEventListener( 'change',orbitChange ,false );
  globals.controls.addEventListener( 'start',orbitStart ,false );
  globals.controls.addEventListener( 'end',orbitEnd ,false );

  //globals.controls.autoRotate = true
  //globals.controls.autoRotateSpeed = 1.0
  
  const LIGHT_COLOUR = 0xffffff
  const LIGHT_INTENSITY = 1.2
  const LIGHT_DISTANCE = 10

  const light1 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light1.position.set(0, 0, LIGHT_DISTANCE)
  globals.scene.add(light1)

  const light2 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light2.position.set(0, 0, -LIGHT_DISTANCE)
  globals.scene.add(light2)

  const light3 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light3.position.set(0, LIGHT_DISTANCE, 0)
  globals.scene.add(light3)

  const light4 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light4.position.set(0, -LIGHT_DISTANCE, 0)
  globals.scene.add(light4)

  const light5 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light5.position.set(LIGHT_DISTANCE, 0, 0)
  globals.scene.add(light5)

  const light6 = new THREE.DirectionalLight(LIGHT_COLOUR, LIGHT_INTENSITY)
  light6.position.set(-LIGHT_DISTANCE, 0, 0)
  globals.scene.add(light6)

  globals.puzzleGroup = new THREE.Group()
  globals.scene.add(globals.puzzleGroup)

  globals.animationGroup = new THREE.Group()
  globals.scene.add(globals.animationGroup)

  globals.clock = new THREE.Clock()
  globals.animationMixer = new THREE.AnimationMixer()

  globals.cube = L.getSolvedCube(CUBE_SIZE)
  const pieceGeometry = await loadGeometry('models/cube-bevelled.glb')
  
  pieceGeometry.faces.forEach(function (item, index, object) {
      if (U.closeTo(item.normal.y, 1) || U.closeTo(item.normal.y, -1) || 
      U.closeTo(item.normal.x, 1) || U.closeTo(item.normal.x, -1) ||
      U.closeTo(item.normal.z, 1) || U.closeTo(item.normal.z, -1)) {
        //console.log(index)
        object.splice(index, 1)
        object.splice(index+1, 1)
      }
  })
  
  //console.log( pieceGeometry.faces );
  
  createUiPieces(globals.cube, pieceGeometry)

  animate()
  //scramble()
}

init()

var girando = false
const mueveUno = (moves, nextMoveIndex = 0) => {

  const move = moves[nextMoveIndex]


  if (!move) {
    //console.log('No hay otro movimiento ')
    //return setTimeout(scramble, 2000)
  }

  //console.log('Mueve ' + move)
  const pieces = L.getPieces(globals.cube, move.coordsList)
  const uiPieces = pieces.map(findUiPiece)
  movePiecesBetweenGroups(uiPieces, globals.puzzleGroup, globals.animationGroup)

  const onFinished = () => {
    globals.animationMixer.removeEventListener('finished', onFinished)
    movePiecesBetweenGroups(uiPieces, globals.animationGroup, globals.puzzleGroup)
    globals.cube = move.makeMove(globals.cube)
    const rotationMatrix3 = move.rotationMatrix3
    const rotationMatrix4 = makeRotationMatrix4(rotationMatrix3)
    for (const uiPiece of uiPieces) {
      uiPiece.applyMatrix4(rotationMatrix4)
    }
    //console.log('TERMINO')
    girando = false
    //setTimeout(animateMoves, SPEED_MILLISECONDS, moves, nextMoveIndex + 1)
  }

  globals.animationMixer.addEventListener('finished', onFinished)

  const animationClip = createAnimationClip(move)
  const clipAction = globals.animationMixer.clipAction(
    animationClip,
    globals.animationGroup)
  clipAction.setLoop(THREE.LoopOnce)
  clipAction.play()
}

//var movIndex = 0 //quitar una vez entendidos
let stats;
stats = new Stats();
document.body.appendChild( stats.dom );
// -----------mouseEvent-------------

/*
var mouse = new THREE.Vector2()

let mousePressed = false
let cualCubo
const mousePressedPoint = new THREE.Vector2();
let deltaMouse = new THREE.Vector2();

function onMouseUp(event) {
  globals.controls.enabled = true;
  event.preventDefault();
  mousePos(event)

  if (mousePressed && globals.cuboClick != NaN && girando == false) {
    deltaMouse.x = mouse.x - mousePressedPoint.x
    deltaMouse.y = mouse.y - mousePressedPoint.y
    //console.log(deltaMouse)
    //console.log(globals.cuboClick)
    if (Math.abs(deltaMouse.x) > Math.abs(deltaMouse.y)) { // mov horizontal
      //console.log('horizontal')
      if (deltaMouse.x < 0) { // mov a la izquierda
        if (globals.cuboClick.y == 1) muevelo(10)
        else if (globals.cuboClick.y == 0) muevelo(8)
        else if (globals.cuboClick.y == -1) muevelo(6)
      } else  { // mov a la derecha
        if (globals.cuboClick.y == 1) muevelo(11)
        else if (globals.cuboClick.y == 0) muevelo(9)
        else if (globals.cuboClick.y == -1) muevelo(7)
      }
    } 
    else if (Math.abs(deltaMouse.x) < Math.abs(deltaMouse.y)){ // mov vertical
      //console.log('vertical')
      if (deltaMouse.y > 0) { // mov arriba
        if (globals.cuboClick.x == 1) muevelo(4)
        else if (globals.cuboClick.x == 0) muevelo(2)
        else if (globals.cuboClick.x == -1) muevelo(0)
      } else { // mov abajo
        if (globals.cuboClick.x == 1) muevelo(5)
        else if (globals.cuboClick.x == 0) muevelo(3)
        else if (globals.cuboClick.x == -1) muevelo(1)
      }

    }
    
    console.log ('onMouseUp ')
    console.log (mouse)
    console.log ('con  mousePressedPoint')
    console.log (mousePressedPoint)
    console.log ('deltaMouse')
    console.log (deltaMouse)
    
  }
  mousePressed = false
  globals.cuboClick = NaN
  //console.log(globals.cuboClick)
}

function onMouseDown(event) {
  globals.controls.enabled = true;
  event.preventDefault();
  mousePos(event)

  console.log(globals.controls)
  
  mousePressedPoint.x = mouse.x
  mousePressedPoint.y = mouse.y
  mousePressed = true
  globals.cuboClick = NaN

  raycaster.setFromCamera(mouse, globals.camera);
  var intersects = raycaster.intersectObjects(globals.scene.children, true);
  if (intersects.length > 0) {
    globals.controls.enabled = false;
    globals.cuboClick = intersects[0].object.parent.position
    //console.log(intersects[0].object.userData) // entero, el orden en el que fue creada cada ficha
    //console.log(intersects[0].object)
    //console.log(intersects[0])
  }
}

function onMouseMove(event) {
  event.preventDefault();
  mousePos(event)
}

function mousePos(event) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener('pointerdown', onMouseDown);
//window.addEventListener('mousedown', onMouseDown);
window.addEventListener('pointerup', onMouseUp);
//window.addEventListener('mouseup', onMouseUp);
window.addEventListener('mousemove', onMouseMove);


var mousePointer = new THREE.Vector2();

function onMouseDown(event) {
  console.log('De mouse')
  event.preventDefault();
  mousePointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mousePointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(mousePointer, globals.camera);
  var intersects = raycaster.intersectObjects(globals.scene.children, true);

  console.log(event.clientX)
  console.log(event.clientY)
  console.log(event.clientX / window.innerWidth)
  console.log(event.clientY / window.innerHeight)
  console.log(mousePointer)
  console.log(intersects)
  if (intersects.length > 0) {
    globals.controls.enabled = false;
    globals.cuboClick = intersects[0].object.parent.position
    //console.log(intersects[0].object.userData) // entero, el orden en el que fue creada cada ficha
    //console.log(intersects[0].object)
    //console.log(intersects[0])
  }
}

window.addEventListener('pointerdown', onMouseDown);

*/