// 3D Synthwave Retro Grid Background using Three.js

const initBackground = () => {
    // Disable Three.js background to use video instead
    return;
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x081018);
    scene.fog = new THREE.FogExp2(0x081018, 0.002);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 100);
    camera.lookAt(0, 0, -100);

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Grid / Terrain Generation
    // We use two planes to create an infinite loop effect
    const planeWidth = 400;
    const planeHeight = 400;
    const planeSegments = 40;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, planeSegments, planeSegments);
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        const zIndex = vertex.y / planeHeight;
        const wobble = Math.sin(vertex.y * 0.08) * 1.5;
        positionAttribute.setZ(i, wobble * (1 - zIndex));
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ffd5,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });

    // Create two planes for infinite scrolling
    const plane1 = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    plane1.rotation.x = -Math.PI / 2;
    plane2.rotation.x = -Math.PI / 2;

    plane1.position.z = 0;
    plane2.position.z = -planeHeight; // Behind the first one

    scene.add(plane1);
    scene.add(plane2);

    const roadMaterial = new THREE.MeshBasicMaterial({
        color: 0x05070c
    });
    const roadGeometry = new THREE.PlaneGeometry(40, planeHeight * 2, 1, 1);
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.05;
    road.position.z = -planeHeight / 2;
    scene.add(road);

    const stripeMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff2a8
    });
    const stripes = [];
    const stripeCount = 10;
    for (let i = 0; i < stripeCount; i++) {
        const stripeGeo = new THREE.PlaneGeometry(2, 16);
        const stripe = new THREE.Mesh(stripeGeo, stripeMaterial);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.y = 0.06;
        stripe.position.z = -i * 60;
        stripes.push(stripe);
        scene.add(stripe);
    }

    const buildingMaterial = new THREE.MeshBasicMaterial({
        color: 0x101826
    });
    const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff2c2
    });

    const buildings = [];
    const windows = [];
    const cityDepth = 8;
    for (let i = 0; i < cityDepth; i++) {
        const zPos = -80 - i * 40;
        for (let side of [-1, 1]) {
            const width = 10 + Math.random() * 10;
            const height = 30 + Math.random() * 40;
            const buildingGeo = new THREE.BoxGeometry(width, height, 20);
            const building = new THREE.Mesh(buildingGeo, buildingMaterial);
            building.position.set(side * (60 + Math.random() * 20), height / 2, zPos + Math.random() * 10);
            buildings.push(building);
            scene.add(building);

            const windowGeo = new THREE.BoxGeometry(width * 0.9, height * 0.9, 0.5);
            const windowMesh = new THREE.Mesh(windowGeo, windowMaterial);
            windowMesh.position.set(building.position.x, building.position.y, building.position.z + 10.5 * side);
            windows.push(windowMesh);
            scene.add(windowMesh);
        }
    }

    const starGeo = new THREE.BufferGeometry();
    const starCount = 700;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPos[i3] = (Math.random() - 0.5) * 420;
        starPos[i3 + 1] = Math.random() * 180 + 60;
        starPos[i3 + 2] = (Math.random() - 0.5) * 420;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xf5f0ff, size: 0.9, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);


    // Mouse interaction for slight camera sway
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.01;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.01;
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const speed = 2.4;

    const animate = () => {
        requestAnimationFrame(animate);

        plane1.position.z += speed;
        plane2.position.z += speed;
        road.position.z += speed;
        stripes.forEach(stripe => {
            stripe.position.z += speed;
            if (stripe.position.z > 40) {
                stripe.position.z -= stripeCount * 60;
            }
        });

        if (plane1.position.z >= planeHeight) {
            plane1.position.z = plane2.position.z - planeHeight;
        }
        if (plane2.position.z >= planeHeight) {
            plane2.position.z = plane1.position.z - planeHeight;
        }

        buildings.forEach((b, index) => {
            b.position.z += speed * 0.6;
            windows[index].position.z += speed * 0.6;
            if (b.position.z > 60) {
                const row = Math.floor(Math.random() * cityDepth);
                const zPos = -80 - row * 40;
                const side = b.position.x > 0 ? 1 : -1;
                const width = 10 + Math.random() * 10;
                const height = 30 + Math.random() * 40;
                b.scale.set(width / b.geometry.parameters.width, height / b.geometry.parameters.height, 1);
                b.position.set(side * (60 + Math.random() * 20), height / 2, zPos + Math.random() * 10);
                windows[index].scale.set(width * 0.9 / windows[index].geometry.parameters.width, height * 0.9 / windows[index].geometry.parameters.height, 1);
                windows[index].position.set(b.position.x, b.position.y, b.position.z + 10.5 * side);
            }
        });

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (30 + mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(0, 18, -200);

        renderer.render(scene, camera);
    };

    animate();
};

document.addEventListener('DOMContentLoaded', initBackground);
