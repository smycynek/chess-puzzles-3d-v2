import * as THREE from 'three';

export function buildLights(): THREE.Light[] {
  const lights: THREE.Light[] = [];
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(0, 1, 0);
  directionalLight.castShadow = true;

  const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLightBottom.position.set(0, -1, 0);
  directionalLightBottom.castShadow = false;

  const light1 = new THREE.PointLight(0xffffff, 0.3, 0, 2);
  light1.position.set(0, 20, 40);

  const light2 = new THREE.PointLight(0xffffff, 0.4, 0, 2);
  light2.position.set(5, 1, 0);

  const light3 = new THREE.PointLight(0xffffff, 0.5, 0, 2);
  light3.position.set(0, 10, -50);

  const light4 = new THREE.PointLight(0xffffff, 0.4, 0, 2);
  light4.position.set(-50, 30, 50);
  lights.push(ambientLight);
  lights.push(directionalLight);
  lights.push(directionalLightBottom);
  lights.push(light1);
  lights.push(light2);
  lights.push(light3);
  lights.push(light4);
  return lights;
}
