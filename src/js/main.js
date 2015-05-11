//fpsの表示----------------------------------
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = '1';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );
//fpsの表示----------------------------------

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
    stats.begin();

    t++;
    if(t < total) {
        setPosition();
    } else if (t > total + delay){
        if(!contraction) { //拡散しきったとき
            initMesh();
        }
        t = 0;
        contraction = !contraction;
        setPosition();
    }
    controls.update();
    renderer.render( scene, camera );

    stats.end();

    requestAnimationFrame( animate );
}


//オブジェクトの配置
//var geometry = new THREE.SphereGeometry(5, 16, 16);
var geometries = [  new THREE.SphereGeometry(5, 10, 10),
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

function initMesh() {

    //既存Meshの削除
    triangles.forEach(function(value, index){
        scene.remove(triangles[index]);
        triangles[index].geometry.dispose();
        triangles[index].material.dispose();
    });

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
        triangle.position.set(Math.round((Math.random() - 0.5) * DIFFUSION_SIZE),
            Math.round((Math.random() - 0.5) * DIFFUSION_SIZE),
            Math.round((Math.random() - 0.5) * DIFFUSION_SIZE));
        triangle.rotation.set(Math.round((Math.random() - 0.5) * ROTATION_ANGLE),
            Math.round((Math.random() - 0.5) * ROTATION_ANGLE),
            Math.round((Math.random() - 0.5) * ROTATION_ANGLE));
        scene.add(triangle);
        triangles.push(triangle);
        pos.push(triangle.position.clone());
        rot.push(triangle.rotation.clone());
    });

    geoIndex++;
    if(geoIndex >= geometries.length){
        geoIndex = 0;
    }
}

function setPosition() {
    var easing;
    if(contraction) {
        easing = 1 - OutCubic(t, total);
    } else {
        easing = OutCubic(t, total);
    }
    triangles.forEach(function(element, index){
        triangles[index].position.set(  pos[index].x * easing,
                                        pos[index].y * easing,
                                        pos[index].z * easing   );
        triangles[index].rotation.set(  rot[index].x * easing,
                                        rot[index].y * easing,
                                        rot[index].z * easing    );
        renderer.domElement.style.opacity = 1 - easing;
    });
}

initMesh();
animate();

function OutCubic( t, total )
{
    t = t / total - 1;
    return ( t * t * t + 1 );
}
