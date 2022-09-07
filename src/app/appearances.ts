/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as THREE from 'three';
import { Vector2 } from 'three';

const path = 'assets/textures/';

export const darkBrown = new THREE.Color(0x665555);
export const ivory = new THREE.Color(0xcfbfab);
export const darkGreen = new THREE.Color(0x009933);
export const ivoryBackground = new THREE.Color(0xcfbfab);

let whiteMarble: THREE.Texture;
let greenGranite: THREE.Texture;
let wood: THREE.Texture;

export const extraDarkGrey = new THREE.Color(0x111111);

export function getWhiteMarble(): THREE.Texture {
  if (!(whiteMarble)) {
    whiteMarble = new THREE.TextureLoader().load(`${path}whiteMarble.jpg`);
    whiteMarble.repeat = new Vector2(0.25, 0.25);
  }
  return whiteMarble;
}

export function getWood(): THREE.Texture {
  if (!wood) {
    wood = new THREE.TextureLoader().load(`${path}wood.jpg`);
    wood.repeat = new Vector2(0.5, 0.5);
  }
  return wood;
}

export function getGreenGranite(): THREE.Texture {
  if (!greenGranite) {
    greenGranite = new THREE.TextureLoader().load(`${path}greenGranite.jpg`);
    greenGranite.repeat = new Vector2(0.25, 0.25);
  }
  return greenGranite;
}
