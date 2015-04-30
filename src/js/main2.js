
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
        console.log(geoIndex);
        geoIndex++;
        if(geoIndex >= geometries.length){
            geoIndex = 0;
        }
        previousVertices = geometries[geoIndex].vertices;
        futureVertices = geometries[(geoIndex + 1) % geometries.length].vertices;
        previousFaces = geometries[geoIndex].faces;
        futureFaces = geometries[(geoIndex + 1) % geometries.length].faces;
        setPosition();
    }
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}


//オブジェクトの配置
//var geometry = new THREE.SphereGeometry(5, 16, 16);
var geometries = [  new THREE.SphereGeometry(10, 10, 10),
    new THREE.BoxGeometry(5, 5, 5, 4, 4, 4),
    new THREE.TorusGeometry( 10, 3, 4, 40 ),
    new THREE.TorusKnotGeometry( 10, 3, 20, 8, 2, 5, 4 )  ];
//var material = new THREE.MeshPhongMaterial( { color: 0x00ffff });
//var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

var DIFFUSION_SIZE = 100;
var ROTATION_ANGLE = 3;
var triangles = [];
var pos = [];
var rot = [];
var geoIndex = 0;
var previousVertices = geometries[0].vertices;
var futureVertices = geometries[1].vertices;
var previousFaces = geometries[0].faces;
var futureFaces = geometries[1].faces;

function init() {

    var geometry = geometries[geoIndex];
    triangles = [];
    pos = [];
    rot = [];

    geometry.faces.forEach(function (face) {
        var a = geometry.vertices[face.a].clone();
        var b = geometry.vertices[face.b].clone();
        var c = geometry.vertices[face.c].clone();
        var geo = new THREE.Geometry();
        var mat = new THREE.MeshPhongMaterial({color: 0xff0000});
        mat.side = THREE.DoubleSide;
        geo.vertices = [a, b, c];
        geo.faces[0] = new THREE.Face3(0, 1, 2);
        geo.computeFaceNormals();

        var triangle = new THREE.Mesh(geo, mat);
        scene.add(triangle);
        triangles.push(triangle);
    });

}

function setPosition() {
    var easing = OutCubic(t, total);
    triangles.forEach(function(element, index) {
        triangles[index].geometry.vertices[0].set(futureVertices[futureFaces[index].a].x * easing
            + previousVertices[previousFaces[index].a].x * (1 - easing),
            futureVertices[futureFaces[index].a].y * easing
            + previousVertices[previousFaces[index].a].y * (1 - easing),
            futureVertices[futureFaces[index].a].z * easing
            + previousVertices[previousFaces[index].a].z * (1 - easing));
        triangles[index].geometry.vertices[1].set(futureVertices[futureFaces[index].b].x * easing
            + previousVertices[previousFaces[index].b].x * (1 - easing),
            futureVertices[futureFaces[index].b].y * easing
            + previousVertices[previousFaces[index].b].y * (1 - easing),
            futureVertices[futureFaces[index].b].z * easing
            + previousVertices[previousFaces[index].b].z * (1 - easing));
        triangles[index].geometry.vertices[2].set(futureVertices[futureFaces[index].c].x * easing
            + previousVertices[previousFaces[index].c].x * (1 - easing),
            futureVertices[futureFaces[index].c].y * easing
            + previousVertices[previousFaces[index].c].y * (1 - easing),
            futureVertices[futureFaces[index].c].z * easing
            + previousVertices[previousFaces[index].c].z * (1 - easing));

        triangles[index].geometry.computeFaceNormals();
        triangles[index].geometry.verticesNeedUpdate = true;
        triangles[index].geometry.normalsNeedUpdate = true;
    });
}

init();
animate();

function OutCubic( t, total )
{
    t = t / total - 1;
    return ( t * t * t + 1 );
}