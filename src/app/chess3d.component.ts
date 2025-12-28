import { AfterViewInit, Component, OnInit, inject, input, model, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as TWEEN from '@tweenjs/tween.js';
import { skip } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { rot13 } from 'cipher-utils';

import {
  ivoryBackground,
  materialAnnotation,
  materialBoardBase,
  materialDarkSquare,
  materialLightSquare,
  offsetTexture,
  setPieceColor,
  setupBaseMaterial,
  setupTileMaterials,
} from './appearances';
import {
  annotationOffset,
  annotationPath,
  base2dUrl,
  boardMidpoint,
  desktopScale,
  endAngle,
  piecePath,
  pieceScale,
  squareLength,
  standardSetup,
  startAngle,
} from './constants';
import { buildLights } from './lighting';
import { puzzleData } from './puzzles';
import { Assignment, BoardFile, Piece, PieceColor, pieceMap } from './types';
import {
  getEmailUrlImp,
  getOrbitCoords,
  getReverseQuery,
  getSmsUrlImp,
  getTwitterUrlImp,
  parseSquareString,
} from './utility';

@Component({
  selector: 'app-chess3d',
  templateUrl: './chess3d.component.html',
  styleUrls: ['./chess3d.component.less'],
})
export class Chess3dComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private router = inject(Router);

  public fieldOfView = input(19.0);
  public nearClippingPane = input(0.01);
  public farClippingPane = input(100000);
  public positionData = model(standardSetup);
  public viewPoint = signal(PieceColor.White);
  public loading = signal(true);
  private canvas!: HTMLCanvasElement;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private pieces: Map<string, THREE.Object3D> = new Map<Piece, THREE.Object3D>();

  private currentPieces: THREE.Object3D[] = new Array<THREE.Object3D>();
  private annotations: Map<string, THREE.Object3D> = new Map<string, THREE.Object3D>();
  private readonly loaderGLTF = new GLTFLoader();
  private renderer!: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();

  private setBlackButton: HTMLButtonElement | null = null;
  private setWhiteButton: HTMLButtonElement | null = null;
  public question = signal('');
  public answer = signal('');
  public showAnswer = signal(false);
  public reverseQuery = signal(
    `${base2dUrl}&editMode=true&view=w&data=${encodeURIComponent(standardSetup)}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public getTwitterUrl = () => getTwitterUrlImp();
  public getEmailUrl = () => getEmailUrlImp();
  public getSmsUrl = () => getSmsUrlImp();

  ngOnInit(): void {
    this.setQuestionAnswer({});
    this.route.queryParams.pipe(skip(1)).subscribe((params) => {
      this.setQuestionAnswer(params);
      this.setData(params);
    });
    this.canvas = document.getElementById('theCanvas') as HTMLCanvasElement;
    this.setBlackButton = document.getElementById('setBlack') as HTMLButtonElement;
    this.setWhiteButton = document.getElementById('setWhite') as HTMLButtonElement;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setQuestionAnswer(params: any) {
    this.question.set(params['question'] || 'QUESTION UNSET');
    this.answer.set(params['answer'] ? rot13(params['answer']) : 'Answer unset.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setData(params: any) {
    this.positionData.update(() => params['data'] || '');
    this.reverseQuery.set(getReverseQuery(params));
    this.viewPoint.set(params['view'] === 'b' ? PieceColor.Black : PieceColor.White);
  }
  async ngAfterViewInit(): Promise<void> {
    await this.createScene().then(() => {
      this.startRenderingLoop();
      this.createControls();
      this.setInitialColorViewPoint();
    });
  }

  public toggleShow(): void {
    this.showAnswer.set(!this.showAnswer());
  }

  public goToRandomPuzzle(): void {
    const data = this.getRandomPuzzleDataObject();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: data,
    });
    this.setData(data);
    this.setQuestionAnswer(data);
    this.showAnswer.set(false);
    this.clearPieces();
    this.drawPositionSetup();
    this.setInitialColorViewPoint();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getRandomPuzzleDataObject(): any {
    const rnd = Math.random();
    const index = Math.floor(rnd * puzzleData.length);
    return puzzleData[index];
  }

  public setPerspectiveModeWhite(): void {
    this.controls.reset();
    this.viewPoint.set(PieceColor.White);
    const coords = { t: startAngle };
    new TWEEN.Tween(coords)
      .to({ t: endAngle })
      .onUpdate(() => this.setCamera(...getOrbitCoords(desktopScale, coords.t)))
      .start();
    this.styleViewpointButtons();
  }

  public setPerspectiveModeBlack(): void {
    this.controls.reset();
    this.viewPoint.set(PieceColor.Black);
    const coords = { t: endAngle };
    new TWEEN.Tween(coords)
      .to({ t: startAngle })
      .onUpdate(() => this.setCamera(...getOrbitCoords(desktopScale, coords.t)))
      .start();
    this.styleViewpointButtons();
  }

  private styleViewpointButtons(): void {
    if (this.setWhiteButton != null && this.setBlackButton != null) {
      this.setBlackButton.classList.remove(
        this.viewPoint() === PieceColor.White ? 'color-button-selected' : 'color-button',
      );
      this.setBlackButton.classList.add(
        this.viewPoint() === PieceColor.White ? 'color-button' : 'color-button-selected',
      );
      this.setWhiteButton.classList.remove(
        this.viewPoint() === PieceColor.White ? 'color-button' : 'color-button-selected',
      );
      this.setWhiteButton.classList.add(
        this.viewPoint() === PieceColor.White ? 'color-button-selected' : 'color-button',
      );
    }
  }

  private createControls(): void {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

  private async drawPositionSetup(): Promise<void> {
    const assignmentList = this.positionData().split(',');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    assignmentList.forEach((assignmentItem: string) => {
      const assignmentObject = parseSquareString(assignmentItem);

      void that.newPiece(assignmentObject);
    });
  }

  private clearPieces(): void {
    this.currentPieces.forEach((piece) => this.scene.remove(piece));
    this.currentPieces = [];
  }

  private drawBase(): void {
    const boardBaseGeometry = new THREE.BoxGeometry(squareLength * 9.3, 0.0075, squareLength * 9.3);
    const boardBaseMesh: THREE.Mesh = new THREE.Mesh(boardBaseGeometry, materialBoardBase);
    boardBaseMesh.position.y -= 0.008;
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
            material = offsetTexture(materialDarkSquare, 0.75);
          } else {
            material = offsetTexture(materialLightSquare, 0.75);
          }
        } else if (jdx % 2 === 0) {
          material = offsetTexture(materialLightSquare, 0.75);
        } else {
          material = offsetTexture(materialDarkSquare, 0.75);
        }

        const squareMesh: THREE.Mesh = new THREE.Mesh(squareGeometry, material);
        squareMesh.position.y -= 0.006;
        squareMesh.position.x += jdx * squareLength + -boardMidpoint;
        squareMesh.position.z += idx * -squareLength + boardMidpoint;
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

  private async newPiece(assignment: Assignment): Promise<void> {
    const pieceKey = `${assignment.piece}_${assignment.color}`;
    let newPiece = this.pieces.get(pieceKey)?.clone(true);
    if (newPiece == null) {
      await this.loadPiece(assignment.piece);
      newPiece = this.pieces.get(pieceKey)?.clone(true);
    }
    if (newPiece != null) {
      if (assignment.piece === Piece.Knight) {
        if (assignment.color === PieceColor.White) {
          newPiece.rotation.z = Math.PI / 4;
        } else {
          newPiece.rotation.z = Math.PI + Math.PI / 4;
        }
      }
      if (assignment.piece === Piece.Bishop) {
        if (assignment.color === PieceColor.White) {
          newPiece.rotation.z = Math.PI / 2;
        } else {
          newPiece.rotation.z = Math.PI / 4;
        }
      }
      if (assignment.color === PieceColor.White) {
        setPieceColor(newPiece, PieceColor.White);
      } else {
        setPieceColor(newPiece, PieceColor.Black);
      }
      newPiece.position.y = 0;
      newPiece.position.x = (assignment.file - 1) * squareLength + -boardMidpoint;
      newPiece.position.z = -(assignment.rank - 1) * squareLength + boardMidpoint;
      this.scene.add(newPiece);
      this.currentPieces.push(newPiece);
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
    this.pieces.set(`${piece}_${PieceColor.White}`, whitePiece);
    this.pieces.set(`${piece}_${PieceColor.Black}`, blackPiece);
  }

  private async newAnnotation(name: string, position: number, side: string): Promise<void> {
    const newModel = this.annotations.get(name)?.clone();

    if (newModel != null) {
      newModel.position.y += 0.0005;
      if (side === 'front') {
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = boardMidpoint + squareLength * annotationOffset;
      } else if (side === 'back') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = -boardMidpoint + squareLength * (position - 1);
        newModel.position.z = -boardMidpoint + -squareLength * annotationOffset;
      } else if (side === 'left') {
        newModel.position.x = -boardMidpoint - squareLength * annotationOffset;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * position;
      } else if (side === 'right') {
        newModel.rotation.z = Math.PI;
        newModel.position.x = boardMidpoint + squareLength * annotationOffset;
        newModel.position.z = boardMidpoint + squareLength + -squareLength * position;
      }
      this.scene.add(newModel);
    } else {
      console.warn('Annotation not found!');
    }
  }

  private async loadAnnotation(name: string): Promise<void> {
    const gltfP = await this.loaderGLTF.loadAsync(`${annotationPath}${name}.gltf`);
    const gltf = gltfP;
    let model;
    if (gltf.scene.children.length === 3) {
      model = gltf.scene.children[2];
    } else {
      model = gltf.scene.children[0];
    }
    model.rotation.x = Math.PI / 2;
    model.rotation.y = Math.PI;
    model.rotation.z = Math.PI;
    model.position.y = -0.0045;
    model.scale.multiplyScalar(0.25);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.traverse((object: any) => {
      if (object.isMesh) {
        object.material = materialAnnotation;
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
      this.fieldOfView(),
      aspectRatio,
      this.nearClippingPane(),
      this.farClippingPane(),
    );
    this.camera.lookAt(0.0, 0, 0);
    this.scene.background = ivoryBackground;
    this.setCamera(...getOrbitCoords(desktopScale, endAngle));
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
    try {
      await this.drawPositionSetup();
    } catch {
      this.question.set('Error drawing position setup, showing standard board');
      this.positionData.update(() => standardSetup);
      await this.drawPositionSetup();
    } finally {
      this.enlargeCanvas();
      this.loading.set(false);
    }
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
    if (this.viewPoint() === PieceColor.Black) {
      this.setPerspectiveModeBlack();
    } else {
      this.setPerspectiveModeWhite();
    }
  }

  private getAspectRatio = (): number =>
    this.canvas ? this.canvas.clientWidth / this.canvas.clientHeight : 1;

  private setCamera(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0.0, 0, 0);
  }

  private startRenderingLoop(): void {
    if (!this.canvas) {
      return;
    }
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const component: Chess3dComponent = this;
    (function render() {
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
      TWEEN.update();
    })();
  }
}
