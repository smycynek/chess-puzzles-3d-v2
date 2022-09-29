import * as THREE from 'three';

export function buildLights(): THREE.Light[] {
  const lights: THREE.Light[] = [];
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

  const directionalTop = new THREE.PointLight(0xffffff, 0.01);
  directionalTop.position.set(0.2, 1, 0.2);
  directionalTop.castShadow = false;

  const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLightBottom.position.set(0, -1, 0);
  directionalLightBottom.castShadow = false;

  const directionalLightSide1 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLightSide1.position.set(1, 0, 0);
  directionalLightSide1.castShadow = true;

  const directionalLightSide2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLightSide2.position.set(-1, 0, 0);
  directionalLightSide2.castShadow = true;

  const directionalLightSide3 = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLightSide3.position.set(0, 0, -1);
  directionalLightSide3.castShadow = true;

  const directionalLightSide4 = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLightSide4.position.set(0, 0, 1);
  directionalLightSide4.castShadow = true;

  const light1 = new THREE.PointLight(0xffffff, 0.1, 0, 2);
  light1.position.set(0, 1.8, 1);

  const light2 = new THREE.PointLight(0xffffff, 0.1, 0, 2);
  light2.position.set(1, 1.8, 0);

  const light3 = new THREE.PointLight(0xffffff, 0.01, 0, 2);
  light3.position.set(1, 0.1, -1);

  lights.push(ambientLight);
  lights.push(directionalTop);
  lights.push(directionalLightBottom);

  lights.push(directionalLightSide1);
  lights.push(directionalLightSide2);
  lights.push(directionalLightSide3);
  lights.push(directionalLightSide4);

  lights.push(light1);
  lights.push(light2);
  lights.push(light3);

  return lights;
}
