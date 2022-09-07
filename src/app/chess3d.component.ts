/* eslint-disable dot-notation */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import { darkBrown, darkGreen, extraDarkGrey, getGreenGranite, getWhiteMarble, getWood, ivory, ivoryBackground } from './appearances';
import { BoardFile, Piece, PieceColor, pieceMap } from './types';
import { parseSquareString } from './utility';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rot13Cipher = require('rot13-cipher');

const squareLength = 0.05;
const boardMidpoint: number = (squareLength * 3.5); // for piece placement;
const pieceScale = 1.0;

const headline = 'Try%20this%20chess%20puzzle.';
const twitterBase = 'http://twitter.com/share?text=';

@Component({
  selector: 'chess3d',
  templateUrl: './chess3d.component.html',
  styleUrls: ['./chess3d.component.less'],
})
export class Chess3dComponent implements OnInit, AfterViewInit {
  @Input() public fieldOfView = 1;
  @Input('nearClipping') public nearClippingPane = 1;
  @Input('farClipping') public farClippingPane = 1000;
  @Input('dataStr') public dataStr = 'wRa1,wNb1,wBc1,wQd1,wKe1,wBf1,wNg1,wRh1,wPa2,wPb2,wPc2,wPd2,wPe2,wPf2,wPg2,wPh2,bRa8,bNb8,bBc8,bQd8,bKe8,bBf8,bNg8,bRh8,bPa7,bPb7,bPc7,bPd7,bPe7,bPf7,bPg7,bPh7';
  public viewPoint: PieceColor = PieceColor.White;
  public loading = true;
  private materialDarkSquare = new THREE.MeshStandardMaterial();
  private materialLightSquare = new THREE.MeshStandardMaterial();
  private materialWhitePiece = new THREE.MeshPhongMaterial();
  private materialBlackPiece = new THREE.MeshPhongMaterial();
  private materialFelt = new THREE.MeshPhongMaterial();
  private materialBoardBase = new THREE.MeshStandardMaterial();
  private canvas!: HTMLCanvasElement;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private ambientLight!: THREE.AmbientLight;
  private light1!: THREE.PointLight;
  private light2!: THREE.PointLight;
  private light3!: THREE.PointLight;
  private light4!: THREE.PointLight;
  private pieces!: Map<string, THREE.Object3D>;
  private annotations!: Map<string, THREE.Object3D>;
  private directionalLight!: THREE.DirectionalLight;
  private directionalLightBottom!: THREE.DirectionalLight;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pieceList!: any[];
  private readonly loaderGLTF = new GLTFLoader();
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private setBlackButton: HTMLButtonElement | null;
  private setWhiteButton: HTMLButtonElement | null;
  public question = '';
  public answer = '';
  // reverseQuery: any;
  public showAnswer: boolean;

  constructor(private readonly route: ActivatedRoute) {
    this.showAnswer = false;
    this.setBlackButton = null;
    this.setWhiteButton = null;
  }

  public getTwitterUrl(): string {
    const fullStr = encodeURIComponent(window.location.toString());
    return `${twitterBase}${headline}&url=${fullStr}&hashtags=chesspuzzle`;
  }

  public getEmailUrl(): string {
    const fullStr = encodeURIComponent(window.location.toString());
    return `mailto:?subject=${headline}&body=${fullStr}`;
  }

  public getSmsUrl(): string {
    const fullStr = encodeURIComponent(window.location.toString());
    return `sms:&body=${headline}%20${fullStr}`;
  }

  ngOnInit(): void {
    this.answer = 'hafrg';
    this.route.queryParams
      .subscribe((params) => {
        if (params['data']) {
          this.dataStr = params['data'] || '';
        }
        this.question = params['question'] || 'QUESTION UNSET';
        this.answer = rot13Cipher(params['answer'] ? params['answer'] : 'Nafjre hafrg');
        // this.reverseQuery = this.getReverseQuery(params);
        this.viewPoint = params['view'] === 'b' ? PieceColor.Black : PieceColor.White;
      });

    this.pieceList = [];
    this.canvas = document.getElementById('theCanvas') as HTMLCanvasElement;
    this.setBlackButton = document.getElementById('setBlack') as HTMLButtonElement;
    this.setWhiteButton = document.getElementById('setWhite') as HTMLButtonElement;
  }

  async ngAfterViewInit(): Promise<void> {
    await this.createScene().then(() => {
      this.startRenderingLoop();
      this.createControls();
      this.setViewPoint();
    });
  }

  public toggleShow(): void {
    this.showAnswer = !this.showAnswer;
  }
  public setCamera(x: number, y: number, z: number, updateLook: boolean): void {
    this.camera.position.set(x, y, z);
    if (updateLook) {
      this.camera.lookAt(0, 0, 0);
    }
  }

  public setPerspectiveModeWhite(): void {
    const coords = { t: (250 * 3.14) / 180 };

    new TWEEN.Tween(coords)
      .to({ t: (70 * 3.14) / 180 })
      // eslint-disable-next-line max-len
      .onUpdate(() => this.setCamera(1.41 * -14 * Math.cos(coords.t), 7, 1.41 * 14 * Math.sin(coords.t), true)).start();

    if ((this.setWhiteButton != null) && (this.setBlackButton != null)) {
      this.setBlackButton.classList.remove('color-button-selected');
      this.setBlackButton.classList.add('color-button');
      this.setWhiteButton.classList.remove('color-button');
      this.setWhiteButton.classList.add('color-button-selected');
    }
  }

  public setPerspectiveModeBlack(): void {
    const coords = { t: (70 * 3.14) / 180 };

    new TWEEN.Tween(coords)
      .to({ t: (250 * 3.14) / 180 })
      // eslint-disable-next-line max-len
      .onUpdate(() => this.setCamera(1.41 * -14 * Math.cos(coords.t), 7, 1.41 * 14 * Math.sin(coords.t), true)).start();

    if ((this.setWhiteButton != null) && (this.setBlackButton != null)) {
      this.setBlackButton.classList.remove('color-button');
      this.setBlackButton.classList.add('color-button-selected');
      this.setWhiteButton.classList.remove('color-button-selected');
      this.setWhiteButton.classList.add('color-button');
    }
  }

  public toggleBlackWhiteView(): void {
    if (this.viewPoint === PieceColor.White) {
      this.viewPoint = PieceColor.Black;
      this.setPerspectiveModeBlack();
    } else {
      this.viewPoint = PieceColor.White;
      this.setPerspectiveModeWhite();
    }
  }

  private createControls(): void {
    const renderer = new CSS2DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('canvas-container');
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = `${this.canvas.offsetTop}px`;
    renderer.domElement.style.left = `${this.canvas.offsetLeft}px`;
    renderer.domElement.style.height = `${this.canvas.clientHeight}px`;
    renderer.domElement.style.width = `${this.canvas.clientWidth}px`;
    // renderer.domElement.style.border = "solid";
    // renderer.domElement.style.borderColor = "grey";
    if (container != null) {
      container.appendChild(renderer.domElement);
    }
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    this.controls.update();
  }

  private async drawPositionSetup(pieceList: string): Promise<void> {
    const assignments = pieceList.split(',');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    assignments.forEach((assignment: string) => {
      const data = parseSquareString(assignment);
      // eslint-disable-next-line no-void
      void that.newPiece(data.piece, data.file, data.rank, data.color);
    });
  }
  private static offsetTexture(material: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    const materialNew = material.clone();
    if (materialNew.map != null) {
      materialNew.map = materialNew.map.clone();
      const offset1 = Math.random() * 0.75;
      const offset2 = Math.random() * 0.75;
      materialNew.map.offset = new Vector2(offset1, offset2);
    }
    return materialNew;
  }

  private drawBase(): void {
    const boardBaseGeometry = new THREE.BoxGeometry(squareLength * 10, 0.03, squareLength * 10);
    const boardBaseMesh: THREE.Mesh = new THREE.Mesh(boardBaseGeometry, this.materialBoardBase);
    boardBaseMesh.position.y -= 0.02;
    boardBaseMesh.position.x = 0;
    boardBaseMesh.position.z = 0;
    this.scene.add(boardBaseMesh);
  }

  private drawBoard(): void {
    for (let idx = 0; idx !== 8; idx += 1) {
      let material;
      for (let jdx = 0; jdx !== 8; jdx += 1) {
        const squareGeometry = new THREE.BoxGeometry(squareLength, 0.01, squareLength);
        if (idx % 2 === 0) {
          if (jdx % 2 === 0) {
            material = Chess3dComponent.offsetTexture(this.materialDarkSquare);
          } else {
            material = Chess3dComponent.offsetTexture(this.materialLightSquare);
          }
        } else if (jdx % 2 === 0) {
          material = Chess3dComponent.offsetTexture(this.materialLightSquare);
        } else {
          material = Chess3dComponent.offsetTexture(this.materialDarkSquare);
        }
        const squareMesh: THREE.Mesh = new THREE.Mesh(squareGeometry, material);
        squareMesh.position.y -= 0.0060;
        squareMesh.position.x += (jdx * squareLength) + -boardMidpoint;
        squareMesh.position.z += (idx * -squareLength) + boardMidpoint;
        this.scene.add(squareMesh);
      }
    }
  }

  private drawAnnotations(): void {
    this.newAnnotation('A', 1, 'front');
    this.newAnnotation('B', 2, 'front');
    this.newAnnotation('C', 3, 'front');
    this.newAnnotation('D', 4, 'front');
    this.newAnnotation('E', 5, 'front');
    this.newAnnotation('F', 6, 'front');
    this.newAnnotation('G', 7, 'front');
    this.newAnnotation('H', 8, 'front');

    this.newAnnotation('A', 1, 'back');
    this.newAnnotation('B', 2, 'back');
    this.newAnnotation('C', 3, 'back');
    this.newAnnotation('D', 4, 'back');
    this.newAnnotation('E', 5, 'back');
    this.newAnnotation('F', 6, 'back');
    this.newAnnotation('G', 7, 'back');
    this.newAnnotation('H', 8, 'back');

    this.newAnnotation('1', 1, 'left');
    this.newAnnotation('2', 2, 'left');
    this.newAnnotation('3', 3, 'left');
    this.newAnnotation('4', 4, 'left');
    this.newAnnotation('5', 5, 'left');
    this.newAnnotation('6', 6, 'left');
    this.newAnnotation('7', 7, 'left');
    this.newAnnotation('8', 8, 'left');

    this.newAnnotation('1', 1, 'right');
    this.newAnnotation('2', 2, 'right');
    this.newAnnotation('3', 3, 'right');
    this.newAnnotation('4', 4, 'right');
    this.newAnnotation('5', 5, 'right');
    this.newAnnotation('6', 6, 'right');
    this.newAnnotation('7', 7, 'right');
    this.newAnnotation('8', 8, 'right');
  }

  private setPieceColor(model: THREE.Object3D, color: PieceColor): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.traverse((object: any) => {
      if (object.isMesh) {
        if (!object.name.includes('felt')) {
          if (color === PieceColor.White) {
            object.material = this.materialWhitePiece;
          } else {
            object.material = this.materialBlackPiece;
          }
        } else {
          object.material = this.materialFelt;
        }
      }
    });
  }

  private async newPiece(
    piece: Piece,
    file: BoardFile,
    rank: number,
    color: PieceColor,
  ): Promise<void> {
    const pieceKey = `${piece}_${(color === PieceColor.White) ? 'White' : 'Black'}`;
    let newPiece = this.pieces.get(pieceKey)?.clone(true);
    if (newPiece == null) {
      await this.loadPiece(piece);
      newPiece = this.pieces.get(pieceKey)?.clone(true);
    }
    if (newPiece != null) {
      if (piece === Piece.knight) {
        if (color === PieceColor.White) {
          newPiece.rotation.z = 0;
        } else {
          newPiece.rotation.z = Math.PI;
        }
      }
      if (piece === Piece.bishop) {
        if (color === PieceColor.White) {
          newPiece.rotation.z = Math.PI / 2;
        } else {
          newPiece.rotation.z = Math.PI / 4;
        }
      }
      newPiece.position.y = 0;
      newPiece.position.x = (file - 1) * squareLength + -boardMidpoint;
      newPiece.position.z = -(rank - 1) * squareLength + boardMidpoint;
      this.scene.add(newPiece);
      this.pieceList.push(newPiece);
    }
  }

  private async loadPiece(piece: Piece): Promise<void> {
    const path = 'assets/pieces/';
    const filename = pieceMap.get(piece);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const gltfP = await this.loaderGLTF.loadAsync(path + filename);
    const gltf = gltfP;
    const whiteModel = gltf.scene.children[0];
    const box = new THREE.Box3().setFromObject(whiteModel);
    box.getCenter(whiteModel.position); // this re-sets the mesh position
    whiteModel.rotation.x = Math.PI / 2;
    whiteModel.rotation.y = Math.PI;
    whiteModel.rotation.z = Math.PI / 2;
    whiteModel.position.z = 0;
    whiteModel.position.y = 0.0;
    whiteModel.position.x = 0;
    whiteModel.scale.multiplyScalar(pieceScale);
    this.setPieceColor(whiteModel, PieceColor.White);
    const blackModel = whiteModel.clone();
    this.setPieceColor(blackModel, PieceColor.Black);
    this.pieces.set(`${piece}_White`, whiteModel);
    this.pieces.set(`${piece}_Black`, blackModel);
  }

  private newAnnotation(name: string, position: number, side: string): void {
    const newModel = this.annotations.get(name)?.clone();
    if (newModel != null) {
      if (side === 'front') {
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = boardMidpoint + squareLength * 0.8; // //.04
      } else if (side === 'back') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = -boardMidpoint + -squareLength * 0.8;
      } else if (side === 'left') {
        newModel.position.x = -boardMidpoint - squareLength * 0.8;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * (position);
      } else if (side === 'right') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = boardMidpoint + squareLength * 0.8;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * (position);
      }
      this.scene.add(newModel);
    }
  }

  private async loadAnnotation(name: string): Promise<void> {
    const path = 'assets/annotations/';
    const gltfP = await this.loaderGLTF.loadAsync(`${path + name}.gltf`);
    const gltf = gltfP;
    const model = gltf.scene.children[0];

    const box = new THREE.Box3().setFromObject(model);
    box.getCenter(model.position); // this re-sets the mesh position
    model.rotation.x = Math.PI / 2;
    model.rotation.y = Math.PI;
    model.rotation.z = Math.PI;
    model.position.y = -0.01;
    model.scale.multiplyScalar(0.25);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.traverse((object: any) => {
      if (object.isMesh) {
        object.material.color = extraDarkGrey;
      }
    });
    this.annotations.set(name, model);
  }

  private async loadAnnotations(): Promise<void> {
    await this.loadAnnotation('A');
    await this.loadAnnotation('B');
    await this.loadAnnotation('C');
    await this.loadAnnotation('D');
    await this.loadAnnotation('E');
    await this.loadAnnotation('F');
    await this.loadAnnotation('G');
    await this.loadAnnotation('H');
    await this.loadAnnotation('1');
    await this.loadAnnotation('2');
    await this.loadAnnotation('2');
    await this.loadAnnotation('3');
    await this.loadAnnotation('4');
    await this.loadAnnotation('5');
    await this.loadAnnotation('6');
    await this.loadAnnotation('7');
    await this.loadAnnotation('8');
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    this.directionalLight.position.set(0, 1, 0);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    this.directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.1);
    this.directionalLightBottom.position.set(0, -1, 0);
    this.directionalLightBottom.castShadow = false;
    this.scene.add(this.directionalLightBottom);

    this.light1 = new THREE.PointLight(0xffffff, 0.2, 0, 2);
    this.light1.position.set(0, 20, 40);
    this.scene.add(this.light1);
    this.light2 = new THREE.PointLight(0xffffff, 0.3, 0, 2);
    this.light2.position.set(5, 1, 0);
    this.scene.add(this.light2);
    this.light3 = new THREE.PointLight(0xffffff, 0.4, 0, 2);
    this.light3.position.set(0, 10, -50);
    this.scene.add(this.light3);
    this.light4 = new THREE.PointLight(0xffffff, 0.3, 0, 2);
    this.light4.position.set(-50, 30, 50);
    this.scene.add(this.light4);
  }

  private setupBaseMaterial(): void {
    this.materialBoardBase.color = ivory;
    this.materialBoardBase.map = getWood();
  }

  private setupTileMaterials(): void {
    this.materialDarkSquare.map = getGreenGranite();
    this.materialLightSquare.map = getWhiteMarble();
    this.materialBlackPiece.color = darkBrown;
    this.materialWhitePiece.color = ivory;
    this.materialFelt.color = darkGreen;
  }

  private setupView(): void {
    const aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane,
    );
    this.camera.position.x = -14;
    this.camera.position.y = 7;
    this.camera.position.z = 14;
    this.camera.lookAt(0, 0, 0);
    this.scene.background = ivoryBackground;
  }

  private async createScene(): Promise<void> {
    this.scene = new THREE.Scene();
    this.pieces = new Map<Piece, THREE.Object3D>();
    this.annotations = new Map<string, THREE.Object3D>();
    this.setupView();
    this.setupLighting();
    this.setupBaseMaterial();
    this.drawBase();
    this.setupTileMaterials();
    this.drawBoard();
    await this.loadAnnotations();
    this.drawAnnotations();
    await this.drawPositionSetup(this.dataStr);
    this.enlargeCanvas();
    this.loading = false;
  }

  private enlargeCanvas(): void {
    const isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

    if (isMobile != null) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
    } else {
      this.canvas.style.width = '70%';
      this.canvas.style.height = '70%';
    }
  }

  private setViewPoint(): void {
    this.camera.position.x = 14;
    this.camera.position.y = 7;
    this.camera.position.z = -14;
    this.camera.lookAt(0, 0, 0);

    if (this.viewPoint === PieceColor.Black) {
      this.setPerspectiveModeBlack();
    } else {
      this.setPerspectiveModeWhite();
    }
  }

  private getAspectRatio(): number {
    if (this.canvas) {
      return this.canvas.clientWidth / this.canvas.clientHeight;
    }
    return 1;
  }

  private startRenderingLoop(): void {
    if (!this.canvas) {
      return;
    }
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const component: Chess3dComponent = this;
    (function render() {
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
      TWEEN.update();
    }());
  }
}
