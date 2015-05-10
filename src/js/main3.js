
//シーンの用意
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 0, 0, 50 );
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( new THREE.Color(0xffffff) );
document.body.appendChild( renderer.domElement );


var light = new THREE.DirectionalLight( 0xffffff, 2 );
light.position.set( 0, 0, 10 );
light.castShadow = true;
scene.add( light );
//環境光オブジェクト(light2)の設定　
var light2 = new THREE.AmbientLight(0x333333);
//sceneに環境光オブジェクト(light2)を追加
scene.add(light2);

//コントロール
var controls = new THREE.TrackballControls( camera, renderer.domElement);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;
controls.keys = [ 65, 83, 68 ];

var t = 0;
var total = 100;
var delay = 100;
var contraction = true;//拡散or収縮

function animate(){
    t++;
    if(t < total) {
        setPosition();
    } else if (t > total + delay){
        t = 0;
        geoIndex++;
        if(geoIndex >= geometries.length){
            geoIndex = 0;
        }
        previousVertices = geometries[geoIndex].vertices;
        futureVertices = geometries[(geoIndex + 1) % geometries.length].vertices;
        previousFaces = geometries[geoIndex].faces;
        futureFaces = geometries[(geoIndex + 1) % geometries.length].faces;
        console.log(geoIndex);
        setPosition();
    }
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}


//オブジェクトの配置
//var geometry = new THREE.SphereGeometry(5, 16, 16);
var originalGeometries = [  new THREE.SphereGeometry(10, 10, 10),
    new THREE.BoxGeometry(5, 5, 5, 4, 4, 4),
    new THREE.TorusGeometry( 10, 3, 4, 40 ),
    new THREE.TorusKnotGeometry( 10, 3, 20, 8, 2, 5, 4 )  ];
//var material = new THREE.MeshPhongMaterial( { color: 0x00ffff });
//var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

var DIFFUSION_SIZE = 100;
var ROTATION_ANGLE = 3;
var geometries = [];
var mesh;
var geoIndex = 0;
var previousVertices;
var futureVertices;
var previousFaces;
var futureFaces;

function init() {
    originalGeometries.forEach(function (geometry) {
      var trianglesGeometry = new THREE.Geometry();
      geometry.faces.forEach(function (face) {
          var a = geometry.vertices[face.a].clone();
          var b = geometry.vertices[face.b].clone();
          var c = geometry.vertices[face.c].clone();
          var index = trianglesGeometry.vertices.length;
          Array.prototype.push.apply(trianglesGeometry.vertices, [a, b, c]);
          trianglesGeometry.faces.push(new THREE.Face3(index, index+1, index+2));
      });
      geometries.push(trianglesGeometry);
    });

    previousVertices = geometries[0].vertices;
    futureVertices = geometries[1].vertices;
    previousFaces = geometries[0].faces;
    futureFaces = geometries[1].faces;

    var geometry = geometries[0].clone();
    console.log(geometry);
    var material = new THREE.MeshPhongMaterial({color: 0xff0000});
    geometry.computeFaceNormals();
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function setPosition() {
    var easing = OutCubic(t, total);
    mesh.geometry.vertices.forEach(function(element, index) {
      mesh.geometry.vertices[index].set(futureVertices[index].x * easing
            + previousVertices[index].x * (1 - easing),
            futureVertices[index].y * easing
            + previousVertices[index].y * (1 - easing),
            futureVertices[index].z * easing
            + previousVertices[index].z * (1 - easing));
    });
    mesh.geometry.computeFaceNormals();
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
}

init();
animate();

function OutCubic( t, total )
{
    t = t / total - 1;
    return ( t * t * t + 1 );
}
