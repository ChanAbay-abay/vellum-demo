import { writeFileSync, mkdirSync } from "node:fs";
// Captures lab views + a solved-camera render of the terreno model for overlay against the photo.
import { createRequire } from "node:module";
const require = createRequire(
  "/Users/chanchan/Programming/Iridel/demos/vellum-demo/apps/web/package.json"
);
const { chromium } = require("@playwright/test");
const OUT = process.argv[2];
const TAG = process.argv[3] ?? "pass";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3923";
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 700 } });
  page.on("console", (m) => {
    if (m.type() === "error") process.stdout.write(`${["console error:", m.text()].join(" ")}\n`);
  });
  page.on("pageerror", (e) => process.stdout.write(`pageerror: ${e.message}\n`));
  for (const view of ["side", "three-quarter"]) {
    await page.goto(`${BASE}/lab/bikes?model=terreno&view=${view}&lock=1`, {
      waitUntil: "networkidle"
    });
    await page.waitForSelector('[data-testid=bike-canvas][data-ready="1"]', { timeout: 60000 });
    await page.waitForTimeout(800);
    await page
      .locator("[data-testid=bike-canvas]")
      .screenshot({ path: `${OUT}/${TAG}-${view}.png` });
  }
  // Solved-camera render (same lighting recipe as the lab page), transparent background.
  const dataUrl = await page.evaluate(async () => {
    const src = await (await fetch("/src/pages/lab-bikes/ui/lab-bikes-page.tsx")).text();
    const threeUrl = src.match(/from\s+"([^"]*\/three\.js[^"]*)"/)[1];
    const envUrl = src.match(/from\s+"([^"]*RoomEnvironment[^"]*)"/)[1];
    const THREE = await import(threeUrl);
    const { RoomEnvironment } = await import(envUrl);
    const { createTerrenoModel } =
      await import("/src/entities/bike-models/terreno/create-terreno-model.ts");
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(1348, 1080, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(2, 3, 4);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(-3, 2, -3);
    scene.add(key, rim);
    const bike = createTerrenoModel();
    scene.add(bike);
    let tris = 0,
      draws = 0;
    bike.traverse((o) => {
      if (o.isMesh) {
        draws++;
        const g = o.geometry;
        tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
      }
    });
    window.__stats = { tris, draws, groups: bike.children.map((c) => c.name) };
    const camera = new THREE.PerspectiveCamera(60.1, 1348 / 1080, 0.05, 50);
    camera.position.set(0.032, 0.952, 1.332);
    camera.rotation.order = "YXZ";
    camera.rotation.set(-0.1223, -0.0354, 0);
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    const shots = [renderer.domElement.toDataURL("image/png")];
    const nds = new THREE.PerspectiveCamera(30, 1348 / 1080, 0.05, 50);
    nds.position.set(1.4, 1.0, -2.3);
    nds.lookAt(0.1, 0.45, 0);
    renderer.setClearColor(0xe6e6e6, 1);
    renderer.render(scene, nds);
    shots.push(renderer.domElement.toDataURL("image/png"));
    return shots;
  });
  writeFileSync(`${OUT}/${TAG}-solved.png`, Buffer.from(dataUrl[0].split(",")[1], "base64"));
  writeFileSync(`${OUT}/${TAG}-nds.png`, Buffer.from(dataUrl[1].split(",")[1], "base64"));
  process.stdout.write(
    `${["stats", JSON.stringify(await page.evaluate(() => window.__stats))].join(" ")}\n`
  );
  await page.close();
} finally {
  await browser.close();
}
