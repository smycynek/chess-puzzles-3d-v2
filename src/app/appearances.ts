import * as THREE from 'three';

import { Vector2 } from 'three';

import { PieceColor } from './types';

const texturePath = 'assets/textures/';

export const darkGrey = new THREE.Color(0x7799aa);
export const ivory = new THREE.Color(0xecdfdc);
export const white = new THREE.Color(0xffffff);
export const darkGreen = new THREE.Color(0x003311);
export const ivoryBackground = new THREE.Color(0xefdfcb);
export const gold = new THREE.Color(0xefc488);

let whiteGranite: THREE.Texture;
let blueGranite: THREE.Texture;
let wood: THREE.Texture;
let brownMarble: THREE.Texture;
let lightMarble: THREE.Texture;

export function getLightTileTexture(): THREE.Texture {
  if (!whiteGranite) {
    whiteGranite = new THREE.TextureLoader().load(`${texturePath}whiteGranite.jpg`);
    whiteGranite.repeat = new Vector2(0.25, 0.25);
    whiteGranite.rotation = Math.random() * 0.2;
    whiteGranite.colorSpace = THREE.SRGBColorSpace;
  }
  return whiteGranite;
}

export function getDarkTileTexture(): THREE.Texture {
  if (!blueGranite) {
    blueGranite = new THREE.TextureLoader().load(`${texturePath}blueGranite.jpg`);
    blueGranite.repeat = new Vector2(0.25, 0.25);
    blueGranite.rotation = Math.random() * 0.2;
    blueGranite.colorSpace = THREE.SRGBColorSpace;
  }
  return blueGranite;
}

export function getDarkPieceTexture(): THREE.Texture {
  if (!brownMarble) {
    brownMarble = new THREE.TextureLoader().load(`${texturePath}brownMarble.jpg`);
    brownMarble.repeat = new Vector2(1, 1);
    brownMarble.rotation = Math.random() * 0.2;
    brownMarble.colorSpace = THREE.SRGBColorSpace;
  }
  return brownMarble;
}

export function getLightPieceTexture(): THREE.Texture {
  if (!lightMarble) {
    lightMarble = new THREE.TextureLoader().load(`${texturePath}whiteMarble.jpg`);
    lightMarble.repeat = new Vector2(1, 1);
    lightMarble.rotation = Math.random() * 0.2;
    lightMarble.colorSpace = THREE.SRGBColorSpace;
  }
  return lightMarble;
}

export function getBoardTexture(): THREE.Texture {
  if (!wood) {
    wood = new THREE.TextureLoader().load(`${texturePath}redWood.jpg`);
    wood.colorSpace = THREE.SRGBColorSpace;
  }
  return wood;
}

export function offsetTexture(
  material: THREE.MeshPhysicalMaterial,
  scale: number,
): THREE.MeshPhysicalMaterial {
  const materialNew = material.clone();
  if (materialNew.map != null) {
    materialNew.map = materialNew.map.clone();
    materialNew.map.offset = new Vector2(Math.random() * scale, Math.random() * scale);
  }
  return materialNew;
}

export const materialDarkSquare = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  clearcoatRoughness: 1.0,
});

export const materialLightSquare = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  clearcoatRoughness: 0.0,
});

export const materialWhitePiece = new THREE.MeshPhysicalMaterial({
  clearcoat: 0.5,
  clearcoatRoughness: 0.2,
  metalness: 0.15,
});

export const materialBlackPiece = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  clearcoatRoughness: 0.2,
  metalness: 0.15,
});

export const materialFelt = new THREE.MeshPhysicalMaterial({
  roughness: 0.9,
  metalness: 0.0,
  specularIntensity: 0.01,
});

export const materialBoardBase = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  metalness: 0.15,
});

export const materialAnnotation = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  metalness: 0.3,
  specularIntensity: 0.9,
});

export function setupBaseMaterial(): void {
  materialBoardBase.color = new THREE.Color(0xffcccc);
  materialBoardBase.map = getBoardTexture();
}

export function setupTileMaterials(): void {
  materialDarkSquare.map = getDarkTileTexture();
  materialLightSquare.map = getLightTileTexture();
  materialBlackPiece.color = darkGrey;
  materialBlackPiece.map = getDarkPieceTexture();
  materialWhitePiece.color = ivory;
  materialWhitePiece.map = getLightPieceTexture();
  materialFelt.color = darkGreen;
  materialAnnotation.color = gold;
}

export function setPieceColor(model: THREE.Object3D, color: PieceColor): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model.traverse((object: any) => {
    if (object.isMesh) {
      if (!object.name.includes('felt')) {
        if (color === PieceColor.White) {
          object.material = offsetTexture(materialWhitePiece, 0.1);
        } else {
          object.material = offsetTexture(materialBlackPiece, 0.1);
        }
      } else {
        object.material = materialFelt;
      }
    }
  });
}
