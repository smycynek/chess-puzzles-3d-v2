/* eslint-disable dot-notation */
/* eslint-disable prefer-destructuring */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { extraDarkGrey, ivoryBackground, materialBoardBase, materialDarkSquare, materialLightSquare, offsetTexture, setPieceColor, setupBaseMaterial, setupTileMaterials } from './appearances';
import { standardSetup, startAngle, endAngle, squareLength, boardMidpoint, piecePath, pieceScale, annotationOffset, annotationPath, base3dUrl } from './constants';
import { buildLights } from './lighting';
import { Assignment, BoardFile, Piece, PieceColor, pieceMap } from './types';
import { getEmailUrlImp, getOrbitCoords, getReverseQuery, getSmsUrlImp,
  getTwitterUrlImp, parseSquareString } from './utility';
import { puzzles } from './puzzles';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rot13Cipher = require('rot13-cipher');

@Component({
  selector: 'chess3d',
  templateUrl: './chess3d.component.html',
  styleUrls: ['./chess3d.component.less'],
})
export class Chess3dComponent implements OnInit, AfterViewInit {
  @Input() public fieldOfView = 19.0;
  @Input('nearClipping') public nearClippingPane = 0.01;
  @Input('farClipping') public farClippingPane = 100000;
  @Input('dataStr') public dataStr = standardSetup;
  public viewPoint: PieceColor = PieceColor.White;
  public loading = true;
  private canvas!: HTMLCanvasElement;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private pieces: Map<string, THREE.Object3D> = new Map<Piece, THREE.Object3D>();
  private annotations: Map<string, THREE.Object3D> = new Map<string, THREE.Object3D>();
  private readonly loaderGLTF = new GLTFLoader();
  private renderer!: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();

  private setBlackButton: HTMLButtonElement | null = null;
  private setWhiteButton: HTMLButtonElement | null = null;
  public question = '';
  public answer = '';
  public showAnswer = false;
  public reverseQuery = '';

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private readonly route: ActivatedRoute) {
  }

  public getTwitterUrl = () => getTwitterUrlImp();
  public getEmailUrl = () => getEmailUrlImp();
  public getSmsUrl = () => getSmsUrlImp();

  ngOnInit(): void {
    this.route.queryParams
      .subscribe((params) => {
        if (params['data']) {
          this.dataStr = params['data'] || '';
        }
        this.question = params['question'] || 'QUESTION UNSET';
        this.answer = rot13Cipher(params['answer'] ? params['answer'] : 'Nafjre hafrg');
        this.reverseQuery = getReverseQuery(params);
        this.viewPoint = params['view'] === 'b' ? PieceColor.Black : PieceColor.White;
      });
    this.canvas = document.getElementById('theCanvas') as HTMLCanvasElement;
    this.setBlackButton = document.getElementById('setBlack') as HTMLButtonElement;
    this.setWhiteButton = document.getElementById('setWhite') as HTMLButtonElement;
  }

  async ngAfterViewInit(): Promise<void> {
    await this.createScene().then(() => {
      this.startRenderingLoop();
      this.createControls();
      this.setInitialColorViewPoint();
    });
  }

  public toggleShow(): void {
    this.showAnswer = !this.showAnswer;
  }

  public getRandomPuzzle(): string {
    const index = Math.floor(Math.random() * 5);
    return `${base3dUrl}?${puzzles[index]}`;
  }

  public setPerspectiveModeWhite(): void {
    this.controls.reset();
    this.viewPoint = PieceColor.White;
    const coords = { t: startAngle };
    new TWEEN.Tween(coords)
      .to({ t: endAngle })
      .onUpdate(() => this.setCamera(
        ...getOrbitCoords(coords.t),
      )).start();
    this.styleViewpointButtons();
  }

  public setPerspectiveModeBlack(): void {
    this.controls.reset();
    this.viewPoint = PieceColor.Black;
    const coords = { t: endAngle };
    new TWEEN.Tween(coords)
      .to({ t: startAngle })
      .onUpdate(() => this.setCamera(
        ...getOrbitCoords(coords.t),
      )).start();
    this.styleViewpointButtons();
  }

  private styleViewpointButtons(): void {
    if ((this.setWhiteButton != null) && (this.setBlackButton != null)) {
      this.setBlackButton.classList.remove((this.viewPoint === PieceColor.White) ? 'color-button-selected' : 'color-button');
      this.setBlackButton.classList.add((this.viewPoint === PieceColor.White) ? 'color-button' : 'color-button-selected');
      this.setWhiteButton.classList.remove((this.viewPoint === PieceColor.White) ? 'color-button' : 'color-button-selected');
      this.setWhiteButton.classList.add((this.viewPoint === PieceColor.White) ? 'color-button-selected' : 'color-button');
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
    this.camera.lookAt(0.0, 0, 0);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.update();
  }

  private async drawPositionSetup(pieceList: string): Promise<void> {
    const assignmentList = pieceList.split(',');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    assignmentList.forEach((assignmentItem: string) => {
      const assignmentObject = parseSquareString(assignmentItem);
      // eslint-disable-next-line no-void
      void that.newPiece(assignmentObject);
    });
  }

  private drawBase(): void {
    const boardBaseGeometry = new THREE.BoxGeometry(squareLength * 10, 0.03, squareLength * 10);
    const boardBaseMesh: THREE.Mesh = new THREE.Mesh(boardBaseGeometry, materialBoardBase);
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
            material = offsetTexture(materialDarkSquare);
          } else {
            material = offsetTexture(materialLightSquare);
          }
        } else if (jdx % 2 === 0) {
          material = offsetTexture(materialLightSquare);
        } else {
          material = offsetTexture(materialDarkSquare);
        }
        const squareMesh: THREE.Mesh = new THREE.Mesh(squareGeometry, material);
        squareMesh.position.y -= 0.0060;
        squareMesh.position.x += (jdx * squareLength) + -boardMidpoint;
        squareMesh.position.z += (idx * -squareLength) + boardMidpoint;
        this.scene.add(squareMesh);
      }
    }
  }

  private async drawAnnotations(): Promise<void> {
    await Object.keys(BoardFile).forEach(async (item) => {
      if (!Number.isInteger(Number(item))) {
        await this.newAnnotation(item, Object.keys(BoardFile).indexOf(item) - 7, 'front');
        await this.newAnnotation(item, Object.keys(BoardFile).indexOf(item) - 7, 'back');
      } else {
        await this.newAnnotation(item, Object.keys(BoardFile).indexOf(item) + 1, 'left');
        await this.newAnnotation(item, Object.keys(BoardFile).indexOf(item) + 1, 'right');
      }
    });
  }

  private async newPiece(
    assignment: Assignment,
  ): Promise<void> {
    const pieceKey = `${assignment.piece}_${assignment.color}`;
    let newPiece = this.pieces.get(pieceKey)?.clone(true);
    if (newPiece == null) {
      await this.loadPiece(assignment.piece);
      newPiece = this.pieces.get(pieceKey)?.clone(true);
    }
    if (newPiece != null) {
      if (assignment.piece === Piece.Knight) {
        if (assignment.color === PieceColor.White) {
          newPiece.rotation.z = 0;
        } else {
          newPiece.rotation.z = Math.PI;
        }
      }
      if (assignment.piece === Piece.Bishop) {
        if (assignment.color === PieceColor.White) {
          newPiece.rotation.z = Math.PI / 2;
        } else {
          newPiece.rotation.z = Math.PI / 4;
        }
      }
      newPiece.position.y = 0;
      newPiece.position.x = (assignment.file - 1) * squareLength + -boardMidpoint;
      newPiece.position.z = -(assignment.rank - 1) * squareLength + boardMidpoint;
      this.scene.add(newPiece);
    }
  }

  private async loadPiece(piece: Piece): Promise<void> {
    const filename = pieceMap.get(piece);
    const gltfP = await this.loaderGLTF.loadAsync(`${piecePath}${filename}`);
    const whitePiece = gltfP.scene.children[0];
    whitePiece.rotation.x = Math.PI / 2;
    whitePiece.rotation.y = Math.PI;
    whitePiece.rotation.z = Math.PI / 2;
    whitePiece.scale.multiplyScalar(pieceScale);
    const blackPiece = whitePiece.clone();
    setPieceColor(whitePiece, PieceColor.White);
    setPieceColor(blackPiece, PieceColor.Black);
    this.pieces.set(`${piece}_${PieceColor.White}`, whitePiece);
    this.pieces.set(`${piece}_${PieceColor.Black}`, blackPiece);
  }

  private async newAnnotation(name: string, position: number, side: string): Promise<void> {
    const newModel = this.annotations.get(name)?.clone();
    if (newModel != null) {
      if (side === 'front') {
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = boardMidpoint + squareLength * annotationOffset;
      } else if (side === 'back') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = -boardMidpoint + -squareLength * annotationOffset;
      } else if (side === 'left') {
        newModel.position.x = -boardMidpoint - squareLength * annotationOffset;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * (position);
      } else if (side === 'right') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = boardMidpoint + squareLength * annotationOffset;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * (position);
      }
      this.scene.add(newModel);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Annotation not found!');
    }
  }

  private async loadAnnotation(name: string): Promise<void> {
    const gltfP = await this.loaderGLTF.loadAsync(`${annotationPath}${name}.gltf`);
    const gltf = gltfP;
    const model = gltf.scene.children[0];
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
    // TODO, fix this to properly show loading screen when loading annotations from array
    /*
    await Object.keys(BoardFile).forEach(async (item) => {
      await this.loadAnnotation(item);
    });
    */
    await this.loadAnnotation('a');
    await this.loadAnnotation('b');
    await this.loadAnnotation('c');
    await this.loadAnnotation('d');
    await this.loadAnnotation('e');
    await this.loadAnnotation('f');
    await this.loadAnnotation('g');
    await this.loadAnnotation('h');
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
    const lights = buildLights();
    lights.forEach((light: THREE.Light) => this.scene.add(light));
  }

  private setupNeutralView(): void {
    const aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane,
    );
    this.camera.lookAt(0.0, 0, 0);
    this.scene.background = ivoryBackground;
    this.setCamera(
      ...getOrbitCoords(endAngle),
    );
  }

  private async createScene(): Promise<void> {
    this.setupNeutralView();
    this.setupLighting();
    setupBaseMaterial();
    this.drawBase();
    setupTileMaterials();
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

  private setInitialColorViewPoint(): void {
    if (this.viewPoint === PieceColor.Black) {
      this.setPerspectiveModeBlack();
    } else {
      this.setPerspectiveModeWhite();
    }
  }

  private getAspectRatio = () : number => (this.canvas ? (this.canvas.clientWidth / this.canvas.clientHeight) : 1);

  private setCamera(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0.0, 0, 0);
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
