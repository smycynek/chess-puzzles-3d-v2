/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import { Vector2 } from 'three';
import { PieceColor } from './types';

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

export function offsetTexture(material: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  const materialNew = material.clone();
  if (materialNew.map != null) {
    materialNew.map = materialNew.map.clone();
    const offset1 = Math.random() * 0.75;
    const offset2 = Math.random() * 0.75;
    materialNew.map.offset = new Vector2(offset1, offset2);
  }
  return materialNew;
}

export const materialDarkSquare = new THREE.MeshStandardMaterial();
export const materialLightSquare = new THREE.MeshStandardMaterial();
export const materialWhitePiece = new THREE.MeshPhongMaterial();
export const materialBlackPiece = new THREE.MeshPhongMaterial();
export const materialFelt = new THREE.MeshPhongMaterial();
export const materialBoardBase = new THREE.MeshStandardMaterial();

export function setupBaseMaterial(): void {
  materialBoardBase.color = ivory;
  materialBoardBase.map = getWood();
}

export function setupTileMaterials(): void {
  materialDarkSquare.map = getGreenGranite();
  materialLightSquare.map = getWhiteMarble();
  materialBlackPiece.color = darkBrown;
  materialWhitePiece.color = ivory;
  materialFelt.color = darkGreen;
}

export function setPieceColor(model: THREE.Object3D, color: PieceColor): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model.traverse((object: any) => {
    if (object.isMesh) {
      if (!object.name.includes('felt')) {
        if (color === PieceColor.White) {
          object.material = materialWhitePiece;
        } else {
          object.material = materialBlackPiece;
        }
      } else {
        object.material = materialFelt;
      }
    }
  });
}
