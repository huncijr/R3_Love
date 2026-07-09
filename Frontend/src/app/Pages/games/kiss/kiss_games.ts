import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import * as THREE from 'three';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  Contact,
  HandHeart,
  LUCIDE_ICONS,
  LucideIconProvider,
  LucideAngularModule,
  Mars,
  Venus,
  HeartOff,
} from 'lucide-angular';

@Component({
  selector: 'app-kiss',
  imports: [HlmButton, LucideAngularModule],
  templateUrl: './kiss_games.html',
  styleUrl: './kiss_games.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        Contact,
        HandHeart,
        Mars,
        Venus,
        HeartOff,
      }),
    },
  ],
})
export class KissComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: false })
  canvasContainer!: ElementRef<HTMLDivElement>;

  currentGender = signal<'male' | 'female'>('male');
  isKissing = signal(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private maleCharacter!: THREE.Group;
  private femaleCharacter!: THREE.Group;

  ngAfterViewInit(): void {
    const initialized = this.initScene();
    if (!initialized) {
      return;
    }
    this.addLights();
    this.createCharacters();
    this.animate();
  }
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer?.dispose();
      this.renderer?.forceContextLoss();
    }
  }

  private initScene(): boolean {
    if (this.renderer) {
      return true;
    }
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported in this browser');
      container.innerHTML = ` <div class="webgl-error flex h-full flex-col items-center justify-center p-6 text-center text-primary-dark">
        <lucide-icon name="heart-off" class="mb-4 h-16 w-16 text-primary]"></lucide-icon>
        <h2 class="mb-2 text-2xl font-bold">Oops, 3D is not available</h2>
        <p>Your browser or device does not support WebGL.</p>
        <p class="text-sm text-neutral">Try enabling hardware acceleration or use another browser.</p>
      </div>`;
      console.error('Webgl not supported');
      return false;
    }
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfff5f7);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 1.6, 4.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onResize);
    return true;
  }

  private addLights(): void {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(4, 6, 4);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
  }

  private createCharacters(): void {
    this.maleCharacter = this.buildCharacter('male');
    this.maleCharacter.position.set(0, 0, 0);
    this.maleCharacter.visible = true;
    this.scene.add(this.maleCharacter);

    this.femaleCharacter = this.buildCharacter('female');
    this.femaleCharacter.position.set(0, 0, 0);
    this.femaleCharacter.visible = false;
    this.scene.add(this.femaleCharacter);
  }

  private buildCharacter(gender: 'male' | 'female'): THREE.Group {
    const group = new THREE.Group();
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: gender === 'male' ? 0x1f2937 : 0xf472b6,
    });
    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: gender === 'male' ? 0x1f2937 : 0xf472b6,
    });

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(gender === 'male' ? 0.34 : 0.3, 32, 32),
      skinMaterial,
    );
    head.position.y = 1.58;
    head.name = `${gender}-head`;
    group.add(head);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(
        gender === 'male' ? 0.32 : 0.28,
        gender === 'male' ? 0.32 : 0.36,
        0.9,
        32,
      ),
      shirtMaterial,
    );

    body.position.y = 0.95;
    body.name = `${gender}-body`;
    group.add(body);

    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7);
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(gender === 'male' ? -0.44 : -0.4, 1.08, 0);
    leftArm.rotation.z = 0.15;
    leftArm.name = `${gender}-left-arm`;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(gender === 'male' ? 0.44 : 0.4, 1.08, 0);
    rightArm.rotation.z = -0.15;
    rightArm.name = `${gender}-right-arm`;
    group.add(rightArm);

    const legGeometry = new THREE.CylinderGeometry(0.11, 0.1, 0.8);
    const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    leftLeg.position.set(-0.16, 0.1, 0);
    leftLeg.name = `${gender}-left-leg`;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    rightLeg.position.set(0.16, 0.1, 0);
    rightLeg.name = `${gender}-right-leg`;
    group.add(rightLeg);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    return group;
  }

  private onResize = (): void => {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;
    const breathe = Math.sin(time * 2) * 0.015;
    if (this.maleCharacter) {
      this.maleCharacter.position.y = breathe;
    }
    if (this.femaleCharacter) {
      this.femaleCharacter.position.y = breathe;
    }
    this.renderer.render(this.scene, this.camera);
  }

  toggleGender(): void {
    const next = this.currentGender() === 'male' ? 'female' : 'male';
    this.currentGender.set(next);
    this.maleCharacter.visible = next === 'male';
    this.femaleCharacter.visible = next === 'female';
  }

  launchKiss(): void {
    if (this.isKissing()) return;
    this.isKissing.set(true);
  }
}
