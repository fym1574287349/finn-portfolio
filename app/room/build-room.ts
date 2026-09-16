import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type RoomSection = 'work' | 'about' | 'life' | 'play' | 'note';
type Options = { onSelect: (id: RoomSection) => void; onHover: (id: RoomSection | null) => void; onError: () => void };

export function createRoom(host: HTMLDivElement, labels: HTMLDivElement, options: Options) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x211d1a, 0);
  renderer.domElement.setAttribute('aria-label', '真实 3D 工作室：拖动旋转，滚轮或双指缩放，点击物件进入板块');
  renderer.domElement.setAttribute('tabindex', '0');
  host.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
  const start = new THREE.Vector3(7.8, 6.7, 9.5);
  const target = new THREE.Vector3(0, 1.0, 0);
  camera.position.copy(start);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.minDistance = 6;
  controls.maxDistance = 21;
  controls.minPolarAngle = .12;
  controls.maxPolarAngle = Math.PI / 2 - .06;
  controls.enablePan = false;
  controls.rotateSpeed = .7;
  controls.zoomSpeed = .8;
  // Azimuth deliberately has no limits: the camera can orbit through every side.
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.update();

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentScene = new RoomEnvironment();
  const environment = pmrem.fromScene(environmentScene, .06);
  scene.environment = environment.texture;
  scene.environmentIntensity = .32;
  environmentScene.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffefd5, 0x574633, 2.4));
  const sun = new THREE.DirectionalLight(0xffe0b0, 4.5);
  sun.position.set(-3.5, 7, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5;
  sun.shadow.normalBias = .035;
  sun.shadow.bias = -.0003;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbdd4ff, .7);
  fill.position.set(4, 3, -4); scene.add(fill);

  let seed = 12;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const textures: THREE.Texture[] = [];
  function canvasTexture(draw: (ctx: CanvasRenderingContext2D) => void, width = 512, height = 512) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d')!);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(texture); return texture;
  }
  const woodTexture = canvasTexture(ctx => {
    ctx.fillStyle = '#92704b'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) {
      const x = random() * 512, y = random() * 512;
      ctx.strokeStyle = `rgba(${random() > .5 ? '49,25,11' : '244,205,148'},${random() * .18})`;
      ctx.lineWidth = .3 + random() * 1.8; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 60, y + random() * 9, x + 160, y - 4, x + 220, y); ctx.stroke();
    }
  });
  const fabricTexture = canvasTexture(ctx => {
    ctx.fillStyle = '#a29277'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      ctx.fillStyle = i % 2 ? '#ffffff19' : '#00000019'; ctx.fillRect(i, 0, 1, 512); ctx.fillRect(0, i, 512, 1);
    }
  });
  const mat = (color: THREE.ColorRepresentation, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const wood = new THREE.MeshStandardMaterial({ color: '#875333', map: woodTexture, roughness: .56 });
  const oak = new THREE.MeshStandardMaterial({ color: '#d0ad77', map: woodTexture, roughness: .73 });
  const darkWood = mat('#402b1f');
  const cream = mat('#ded2b6', .46);
  const dark = mat('#282925', .4);
  const orange = mat('#ce613b', .4);
  const brass = mat('#c39858', .3, .65);
  const paper = mat('#f5e9cf');
  const green = mat('#50613c');
  const upholstery = new THREE.MeshStandardMaterial({ color: '#767953', map: fabricTexture, roughness: .97 });
  const linen = new THREE.MeshStandardMaterial({ color: '#ddc2a0', map: fabricTexture, roughness: .98 });
  const room = new THREE.Group(); scene.add(room);
  function box(parent: THREE.Object3D, size: number[], pos: number[], material: THREE.Material, radius = .015) {
    const geometry = radius ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(radius, Math.min(...size) / 2)) : new THREE.BoxGeometry(...size as [number, number, number]);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...pos as [number, number, number]);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, pos: number[], material: THREE.Material, segments = 32) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
    mesh.position.set(...pos as [number, number, number]); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function sphere(parent: THREE.Object3D, pos: number[], scale: number[], material: THREE.Material) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), material);
    mesh.position.set(...pos as [number, number, number]); mesh.scale.set(...scale as [number, number, number]); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function bar(parent: THREE.Object3D, from: number[], to: number[], radius: number, material: THREE.Material) {
    const a = new THREE.Vector3(...from as [number, number, number]), b = new THREE.Vector3(...to as [number, number, number]);
    const mesh = cylinder(parent, radius, radius, a.distanceTo(b), a.clone().add(b).multiplyScalar(.5).toArray(), material, 12);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize()); return mesh;
  }
  const groups = {} as Record<RoomSection, THREE.Group>;
  const anchors = {} as Record<RoomSection, THREE.Vector3>;
  function interactive(id: RoomSection, at: number[], anchor: number[]) {
    const group = new THREE.Group(); group.position.set(...at as [number, number, number]); group.userData.section = id;
    room.add(group); groups[id] = group; anchors[id] = new THREE.Vector3(...anchor as [number, number, number]); return group;
  }
  // Floorboards, thick miniature plinth, and two open-sided walls.
  box(room, [5.6, .26, 4.8], [0, -.17, 0], darkWood, .07);
  for (let z = 0; z < 15; z++) for (let x = 0; x < 4; x++) {
    const m = oak.clone(); m.color.multiplyScalar(.83 + random() * .23);
    box(room, [1.378, .055, .311], [-2.08 + x * 1.39, -.014, -2.22 + z * .318], m, .006);
  }
  const wallBack = new THREE.Group(), wallLeft = new THREE.Group(); room.add(wallBack, wallLeft);
  const plaster = mat('#bca788', .95);
  box(wallBack, [5.6, 3.25, .13], [0, 1.6, -2.36], plaster, .02);
  box(wallBack, [5.52, .11, .075], [0, .06, -2.25], wood);
  box(wallLeft, [.13, .94, 4.8], [-2.74, .445, 0], plaster);
  box(wallLeft, [.13, .48, 4.8], [-2.74, 3.0, 0], plaster);
  box(wallLeft, [.13, 1.9, .65], [-2.74, 1.85, -2.04], plaster);
  box(wallLeft, [.13, 1.9, 1.22], [-2.74, 1.85, 1.79], plaster);
  box(wallLeft, [.13, .11, 4.7], [-2.64, .06, 0], wood);
  // Window is geometry, including frame, glass and blind slats.
  const glass = new THREE.MeshStandardMaterial({ color: '#bacfc3', emissive: '#e2cba2', emissiveIntensity: .18, roughness: .17, transparent: true, opacity: .48 });
  box(wallLeft, [.03, 1.78, 2.98], [-2.74, 1.83, -.22], glass, 0);
  for (const z of [-1.73, -.23, 1.25]) box(wallLeft, [.15, 1.91, .065], [-2.65, 1.83, z], cream);
  for (const y of [.89, 1.82, 2.78]) box(wallLeft, [.15, .07, 3.07], [-2.65, y, -.23], cream);
  box(wallLeft, [.36, .07, 3.2], [-2.57, .88, -.23], wood);
  for (let i = 0; i < 6; i++) box(wallLeft, [.12, .048, 3.18], [-2.56, 2.72 - i * .085, -.23], wood, .005);

  // Main work desk.
  box(room, [2.86, .13, 1.06], [-1.02, 1.08, -1.47], wood, .055);
  for (const x of [-2.23, .19]) for (const z of [-1.9, -1.07]) box(room, [.075, 1.02, .075], [x, .53, z], darkWood);
  box(room, [.66, .66, .84], [-2.02, .73, -1.45], wood, .03);
  for (let i = 0; i < 3; i++) {
    box(room, [.62, .194, .035], [-2.02, .51 + i * .21, -1.015], oak);
    box(room, [.18, .025, .035], [-2.02, .52 + i * .21, -.978], brass);
  }
  const computer = interactive('work', [-1.0, 1.16, -1.58], [-1, 2.1, -1.45]);
  box(computer, [.94, .17, .68], [0, .09, 0], cream, .025);
  box(computer, [.74, .66, .59], [0, .52, -.03], cream, .065);
  box(computer, [.66, .51, .028], [0, .54, .275], dark, .07);
  const screenTexture = canvasTexture(ctx => {
    ctx.fillStyle = '#1258c8'; ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#f6eed7'; ctx.font = 'italic 77px Georgia'; ctx.textAlign = 'center'; ctx.fillText('hello.', 256, 192);
    ctx.font = '16px monospace'; ctx.fillText('FINN / SELECTED WORK', 256, 245);
    ctx.fillStyle = '#ffffff66'; ctx.fillRect(72, 305, 368, 1);
    ctx.font = '13px monospace'; ctx.fillText('CLICK TO EXPLORE', 256, 334);
  }, 512, 384);
  const screenMat = new THREE.MeshStandardMaterial({ map: screenTexture, emissiveMap: screenTexture, emissive: 0xffffff, emissiveIntensity: .7, roughness: .22 });
  box(computer, [.585, .424, .021], [0, .55, .296], screenMat, .026);
  sphere(computer, [.274, .236, .28], [.018, .018, .01], mat('#aec589'));
  for (let i = 0; i < 9; i++) box(computer, [.008, .18, .025], [.374, .49, -.18 + i * .032], dark, 0);
  box(computer, [.8, .05, .32], [-.02, -.005, .56], cream, .02);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) box(computer, [.05, .025, .05], [-.36 + col * .061, .034, .445 + row * .071], col === 0 && row === 0 ? orange : paper, .006);
  sphere(computer, [.61, -.004, .49], [.105, .045, .145], cream);
  const blueGlow = new THREE.PointLight(0x5089ff, .45, 1.5); blueGlow.position.set(0, .5, .48); computer.add(blueGlow);
  const book = interactive('about', [-1.91, 1.166, -.98], [-1.95, 1.34, -.76]);
  box(book, [.5, .085, .36], [0, .055, 0], paper, .008);
  box(book, [.515, .012, .38], [0, .102, 0], mat('#d58457'), .008);
  const bookTexture = canvasTexture(ctx => { ctx.fillStyle = '#d58457'; ctx.fillRect(0, 0, 512, 512); ctx.fillStyle = '#fff0cf'; ctx.font = '42px Georgia'; ctx.fillText('FINN', 55, 120); ctx.font = '22px monospace'; ctx.fillText('ABOUT ME', 55, 185); ctx.fillRect(55, 395, 80, 3); });
  const bookCover = new THREE.Mesh(new THREE.PlaneGeometry(.5, .365), new THREE.MeshStandardMaterial({ map: bookTexture }));
  bookCover.rotation.x = -Math.PI / 2; bookCover.position.y = .109; book.add(bookCover); book.rotation.y = -.16;
  // Adjustable desk lamp and coffee cup.
  cylinder(room, .14, .17, .035, [.0, 1.18, -1.79], orange);
  bar(room, [0, 1.19, -1.79], [.08, 1.77, -1.81], .018, brass);
  bar(room, [.08, 1.77, -1.81], [-.1, 1.97, -1.72], .018, brass);
  cylinder(room, .075, .16, .16, [-.1, 1.91, -1.71], orange);
  cylinder(room, .126, .126, .009, [-.1, 1.826, -1.71], new THREE.MeshStandardMaterial({ color: '#fff3b4', emissive: '#ffb14d', emissiveIntensity: 2 }));
  const lamp = new THREE.PointLight(0xffb965, 1.5, 2); lamp.position.set(-.1, 1.77, -1.71); room.add(lamp);
  function cup(parent: THREE.Object3D, at: number[]) {
    const group = new THREE.Group(); group.position.set(...at as [number, number, number]); parent.add(group);
    cylinder(group, .083, .068, .16, [0, .08, 0], cream);
    cylinder(group, .073, .073, .004, [0, .162, 0], mat('#3e2b21'));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.05, .014, 8, 20), cream); handle.position.set(.095, .095, 0); group.add(handle);
  }
  cup(room, [-.29, 1.155, -1.06]);
  // Desk chair, turned slightly toward the open room.
  const chair = new THREE.Group(); chair.position.set(-1.05, 0, -.2); chair.rotation.y = -.16; room.add(chair);
  box(chair, [.6, .11, .56], [0, .61, 0], upholstery, .08);
  box(chair, [.61, .43, .075], [0, .94, .24], wood, .04);
  for (const x of [-.245, .245]) for (const z of [-.21, .21]) bar(chair, [x, .02, z + .07], [x * .8, .57, z], .023, darkWood);
  for (const x of [-.23, .23]) bar(chair, [x, .55, .2], [x, 1.12, .23], .019, darkWood);
  // Sofa, real rounded cushions and feet.
  const couch = new THREE.Group(); couch.position.set(1.66, 0, -.69); couch.rotation.y = -Math.PI / 2; room.add(couch);
  for (const x of [-.87, .87]) for (const z of [-.38, .38]) cylinder(couch, .045, .035, .2, [x, .1, z], darkWood, 16);
  box(couch, [2.13, .24, .95], [0, .28, 0], wood, .045);
  box(couch, [2.08, .68, .19], [0, .79, -.42], upholstery, .09);
  for (const x of [-.99, .99]) box(couch, [.18, .53, 1.02], [x, .64, -.01], upholstery, .075);
  for (const x of [-.47, .47]) {
    box(couch, [.9, .22, .82], [x, .49, .06], upholstery, .085);
    const pillow = box(couch, [.48, .44, .17], [x, .83, -.22], x > 0 ? linen : mat('#ad633e'), .07); pillow.rotation.x = -.15; pillow.rotation.z = x > 0 ? -.1 : .1;
  }
  // Woven rug and low coffee table.
  const rugMat = new THREE.MeshStandardMaterial({ color: '#d1ae7c', map: fabricTexture, roughness: 1 });
  box(room, [2.6, .025, 1.98], [.2, .043, .81], rugMat, .025);
  for (let i = 0; i < 27; i++) for (const z of [-.23, 1.85]) box(room, [.017, .006, .08], [-1.02 + i * .094, .05, z], linen, 0);
  const table = new THREE.Group(); table.position.set(.23, 0, .85); table.rotation.y = -.12; room.add(table);
  box(table, [1.52, .09, .8], [0, .48, 0], wood, .17);
  for (const x of [-.53, .53]) for (const z of [-.25, .25]) bar(table, [x * 1.1, .06, z * 1.15], [x, .46, z], .035, wood);
  cup(table, [.41, .53, -.08]);
  const game = interactive('play', [-.05, .565, .92], [-.12, .95, 1]); game.rotation.y = .15;
  box(game, [.34, .07, .53], [0, 0, 0], orange, .04);
  box(game, [.265, .012, .235], [0, .041, -.095], dark, .01);
  box(game, [.212, .005, .17], [0, .049, -.095], mat('#a8b889'), .004);
  box(game, [.12, .012, .034], [-.086, .043, .13], dark, .005);
  box(game, [.034, .013, .12], [-.086, .045, .13], dark, .005);
  for (const [x, z] of [[.065, .145], [.117, .106]]) cylinder(game, .028, .028, .015, [x, .047, z], mat('#733c35'), 16);
  // Wall shelf with books, a camera and record sleeves.
  const shelf = interactive('life', [1.35, 2.08, -2.05], [1.23, 2.68, -1.95]);
  box(shelf, [2.02, .085, .5], [0, 0, 0], wood, .02);
  const bookColors = ['#97684e', '#d6c6a2', '#647668', '#b27d55', '#5d6154'];
  for (let i = 0; i < 7; i++) {
    box(shelf, [.07, .36 + (i % 3) * .045, .27], [-.83 + i * .093, .22, -.07], mat(bookColors[i % 5]), .008);
    box(shelf, [.045, .006, .008], [-.83 + i * .093, .16, .072], brass, 0);
  }
  box(shelf, [.34, .22, .19], [.17, .16, .035], dark, .024);
  box(shelf, [.34, .046, .2], [.17, .27, .035], mat('#b3b1a1', .25, .75), .014);
  const lens = cylinder(shelf, .085, .085, .13, [.17, .16, .17], dark); lens.rotation.x = Math.PI / 2;
  const glassLens = cylinder(shelf, .058, .058, .009, [.17, .16, .241], mat('#243f44', .1, .5)); glassLens.rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++) box(shelf, [.035, .38, .34], [.52 + i * .055, .22, 0], mat(bookColors[i]), .004);
  const record = cylinder(shelf, .18, .18, .015, [.82, .23, .14], dark); record.rotation.x = Math.PI / 2;
  const recordLabel = cylinder(shelf, .052, .052, .018, [.82, .23, .153], orange); recordLabel.rotation.x = Math.PI / 2;
  // Message postcards on the round side table.
  cylinder(room, .32, .32, .07, [2.09, .65, .83], wood);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; bar(room, [2.09 + Math.cos(a) * .24, .04, .83 + Math.sin(a) * .24], [2.09 + Math.cos(a) * .18, .62, .83 + Math.sin(a) * .18], .025, wood); }
  const notes = interactive('note', [2.09, .7, .83], [2.08, 1.24, .85]); notes.rotation.y = -.15;
  box(notes, [.35, .17, .2], [0, .08, 0], orange, .01);
  for (let i = 0; i < 3; i++) { const card = box(notes, [.29, .32 + i * .035, .011], [(i - 1) * .02, .18, -.025 - i * .025], paper, .006); card.rotation.z = (i - 1) * -.06; }
  box(notes, [.15, .08, .013], [.005, .265, -.005], mat('#829589'), .001);
  // Leaf clusters are individual 3D meshes, visible from all sides.
  function plant(at: number[], scale = 1) {
    const group = new THREE.Group(); group.position.set(...at as [number, number, number]); group.scale.setScalar(scale); room.add(group);
    cylinder(group, .19, .135, .31, [0, .155, 0], mat('#baa68c'));
    cylinder(group, .17, .17, .015, [0, .31, 0], darkWood);
    for (let i = 0; i < 11; i++) {
      const angle = i * 2.4, y = .55 + random() * .75, radius = .17 + random() * .3;
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      bar(group, [0, .28, 0], [x, y, z], .009, green);
      const leaf = sphere(group, [x, y, z], [.13, .024, .24], green); leaf.rotation.set(.2 + random(), angle, -.3);
    }
  }
  plant([.55, 0, -1.85], 1.12); plant([-2.24, .91, .53], .39); plant([1.98, 2.13, -2.02], .32);
  // Two framed geometric prints.
  box(wallBack, [.75, .93, .05], [-1.74, 2.42, -2.26], wood, .012);
  box(wallBack, [.66, .84, .012], [-1.74, 2.42, -2.225], paper, .004);
  const printTexture = canvasTexture(ctx => { ctx.fillStyle = '#eee0bc'; ctx.fillRect(0, 0, 512, 512); ctx.fillStyle = '#bd6740'; ctx.beginPath(); ctx.arc(260, 170, 88, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#667361'; ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(180, 245); ctx.lineTo(315, 395); ctx.lineTo(440, 290); ctx.lineTo(512, 512); ctx.fill(); });
  const art = new THREE.Mesh(new THREE.PlaneGeometry(.6, .78), new THREE.MeshStandardMaterial({ map: printTexture })); art.position.set(-1.74, 2.42, -2.213); wallBack.add(art);
  // Ground receives the model's shadow; it is not a rendered room image.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: '#000000', opacity: .24 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.315; ground.receiveShadow = true; scene.add(ground);

  const wallMaterials: THREE.MeshStandardMaterial[][] = [];
  for (const group of [wallLeft, wallBack]) {
    const materials: THREE.MeshStandardMaterial[] = [];
    group.traverse(object => { if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) { object.material = object.material.clone(); object.material.transparent = true; object.material.userData.baseOpacity = object.material.opacity; object.userData.wall = true; materials.push(object.material); } });
    wallMaterials.push(materials);
  }
  const selectorMeshes: THREE.Mesh[] = [];
  room.traverse(object => { if (object instanceof THREE.Mesh) selectorMeshes.push(object); });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: RoomSection | null = null;
  const getSection = (object: THREE.Object3D | null): RoomSection | null => object ? object.userData.section ?? getSection(object.parent) : null;
  function hit(event: PointerEvent) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(selectorMeshes, false);
    const first = hits.find(item => !(item.object.userData.wall && (item.object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity < .5));
    return first ? getSection(first.object) : null;
  }
  let down: { x: number; y: number; time: number } | null = null;
  let dragging = false;
  const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY, time: performance.now() }; dragging = false; };
  const pointerMove = (event: PointerEvent) => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) dragging = true;
    if (dragging) return;
    hovered = hit(event); options.onHover(hovered); renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
  };
  const pointerUp = (event: PointerEvent) => {
    if (down && !dragging && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 7 && performance.now() - down.time < 650) { const id = hit(event); if (id) options.onSelect(id); }
    down = null; dragging = false;
  };
  const pointerLeave = () => { hovered = null; options.onHover(null); };
  const pointerCancel = () => { down = null; dragging = false; };
  const contextLost = (event: Event) => { event.preventDefault(); options.onError(); };
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointerleave', pointerLeave);
  renderer.domElement.addEventListener('pointercancel', pointerCancel);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  const projected = new THREE.Vector3();
  let width = 1, height = 1;
  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    // Preserve the complete room on narrow screens, rather than cropping its sides.
    camera.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(18)) / Math.min(1, camera.aspect)) * 180 / Math.PI;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const initialDistance = start.distanceTo(target);
  let rotating = false;
  function action(type: string) {
    if (type === 'reset') { camera.position.copy(start); controls.target.copy(target); controls.autoRotate = false; rotating = false; controls.update(); }
    if (type === 'zoomIn' || type === 'zoomOut') { const offset = camera.position.clone().sub(controls.target); offset.multiplyScalar(type === 'zoomIn' ? .84 : 1.19); offset.setLength(THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(offset); controls.update(); }
    if (type === 'rotate') { rotating = !rotating; controls.autoRotate = rotating; controls.autoRotateSpeed = 1.2; }
    if (type === 'left' || type === 'right') { const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), type === 'left' ? Math.PI / 4 : -Math.PI / 4); camera.position.copy(controls.target).add(offset); controls.update(); }
  }
  const keyDown = (event: KeyboardEvent) => { const keys: Record<string, string> = { ArrowLeft: 'left', ArrowRight: 'right', '+': 'zoomIn', '=': 'zoomIn', '-': 'zoomOut', Home: 'reset' }; if (keys[event.key]) { event.preventDefault(); action(keys[event.key]); } };
  renderer.domElement.addEventListener('keydown', keyDown);
  let lastTime = 0;
  renderer.setAnimationLoop(time => {
    if (document.hidden || !host.isConnected) return;
    controls.update(Math.min((time - lastTime) / 1000, .05)); lastTime = time;
    const opacity = [camera.position.x < -2.45 ? .055 : 1, camera.position.z < -2.1 ? .055 : 1];
    wallMaterials.forEach((materials, index) => materials.forEach(material => { material.opacity = THREE.MathUtils.lerp(material.opacity, opacity[index] * material.userData.baseOpacity, .13); material.depthWrite = material.opacity > .5; }));
    for (const id of Object.keys(anchors) as RoomSection[]) {
      const label = labels.querySelector<HTMLButtonElement>(`[data-section="${id}"]`);
      if (label) { projected.copy(anchors[id]).project(camera); const x = (projected.x * .5 + .5) * width, y = (-projected.y * .5 + .5) * height; label.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`; label.style.visibility = projected.z > 1 || x < 0 || x > width || y < 0 || y > height ? 'hidden' : 'visible'; }
    }
    host.dataset.cameraAzimuth = controls.getAzimuthalAngle().toFixed(3);
    host.dataset.cameraDistance = (camera.position.distanceTo(controls.target) / initialDistance).toFixed(3);
    renderer.render(scene, camera);
  });
  return { action, dispose() {
    renderer.setAnimationLoop(null); observer.disconnect(); controls.dispose();
    renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove);
    renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointerleave', pointerLeave);
    renderer.domElement.removeEventListener('pointercancel', pointerCancel); renderer.domElement.removeEventListener('webglcontextlost', contextLost); renderer.domElement.removeEventListener('keydown', keyDown);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material); } });
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose()); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
  } };
}
