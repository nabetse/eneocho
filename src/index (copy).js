// fin cubo ------------------

var animate = function() {
  window.requestAnimationFrame(animate)
  //globals.controls.update()
  const delta = globals.clock.getDelta() * globals.animationMixer.timeScale
  //console.log ('desde loop: mousePressedPoint ')
  //console.log (mousePressedPoint)
  globals.animationMixer.update(delta)
  globals.renderer.render(globals.scene, globals.camera)
  //labelRenderer.render(globals.scene, globals.camera);

}






const init = async () => {
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

  //globals.camera = new THREE.PerspectiveCamera(34, w / h, 1, 100)
  //globals.camera.position.set(0, 0, 12)
  globals.camera.lookAt(new THREE.Vector3(0, 0, 0))
  globals.scene.add(globals.camera)
  
  globals.controls = new OrbitControls(globals.camera, globals.renderer.domElement)
  globals.controls.minDistance = 2.0
  globals.controls.maxDistance = 40.0
  globals.controls.enableDamping = true
  globals.controls.dampingFactor = 0.9
  //globals.controls.autoRotate = true
  //globals.controls.autoRotateSpeed = 1.0
  
  
  

  animate()
  //scramble()
}

init()



//var movIndex = 0 //quitar una vez entendidos

globals.cuboClick = new THREE.Vector3()
// -----------mouseEvent-------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

let mousePressed = false
let cualCubo
const mousePressedPoint = new THREE.Vector2();
let deltaMouse = new THREE.Vector2();

function onMouseUp(event) {
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
    /*
    console.log ('onMouseUp ')
    console.log (mouse)
    console.log ('con  mousePressedPoint')
    console.log (mousePressedPoint)
    console.log ('deltaMouse')
    console.log (deltaMouse)
    */
  }
  mousePressed = false
  globals.cuboClick = NaN
  //console.log(globals.cuboClick)
}

function onMouseDown(event) {
  event.preventDefault();
  mousePos(event)
  
  mousePressedPoint.x = mouse.x
  mousePressedPoint.y = mouse.y
  mousePressed = true
  globals.cuboClick = NaN

  raycaster.setFromCamera(mouse, globals.camera);
  var intersects = raycaster.intersectObjects(globals.scene.children, true);
  if (intersects.length > 0) {
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