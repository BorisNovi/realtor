import { Directive, effect, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PrivateLayoutService } from 'src/app/layouts/private-layout/shared';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Directive({
  selector: '[animatedBg]',
})
export class AnimatedBgDirective implements OnInit, OnDestroy {
  readonly layoutService = inject(PrivateLayoutService);

  private canvas!: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: THREE.Object3D[] = [];
  private ambientLight!: THREE.AmbientLight;
  private pointLight!: THREE.PointLight;
  private animationFrameId!: number;
  private mouseX = 0;
  private mouseY = 0;

  private readonly statusMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x50b04d, emissive: new THREE.Color(0x50b04d), emissiveIntensity: 0 }),
    new THREE.MeshStandardMaterial({ color: 0xef8833, emissive: new THREE.Color(0xef8833), emissiveIntensity: 0 }),
    new THREE.MeshStandardMaterial({ color: 0xea3423, emissive: new THREE.Color(0xea3423), emissiveIntensity: 0 }),
  ];
  private get freeMaterial() {
    return this.statusMaterials[0];
  }
  private get reservedMaterial() {
    return this.statusMaterials[1];
  }
  private get rentedMaterial() {
    return this.statusMaterials[2];
  }

  constructor(
    private el: ElementRef,
    private dom: Renderer2,
  ) {
    effect(() => {
      const dark = this.layoutService.isDarkTheme();
      if (this.ambientLight) this.ambientLight.intensity = dark ? 0.3 : 1;
      if (this.pointLight) this.pointLight.power = dark ? 200 : 600;
      this.statusMaterials.forEach(m => (m.emissiveIntensity = dark ? 0.5 : 0.8));
    });
  }

  ngOnInit(): void {
    this.createCanvas();
    this.initScene();
    this.animate();

    window.addEventListener('resize', this.onResize);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  private createCanvas(): void {
    this.canvas = this.dom.createElement('canvas');
    this.dom.setStyle(this.canvas, 'position', 'absolute');
    this.dom.setStyle(this.canvas, 'top', '0');
    this.dom.setStyle(this.canvas, 'left', '0');
    this.dom.setStyle(this.canvas, 'width', '100%');
    this.dom.setStyle(this.canvas, 'height', '100%');
    this.dom.setStyle(this.canvas, 'z-index', '-1');
    this.dom.setStyle(this.canvas, 'pointer-events', 'none');
    this.dom.appendChild(this.el.nativeElement, this.canvas);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.pointLight = new THREE.PointLight(0xffffff, 1);
    this.pointLight.position.set(5, 5, 5);
    this.pointLight.power = 100;
    this.scene.add(this.ambientLight, this.pointLight);

    this.camera.position.z = 20;

    this.loadHouseModel();
  }

  private loadHouseModel(): void {
    const loader = new GLTFLoader();
    loader.load('assets/house_realtor.glb', gltf => {
      const template = gltf.scene;

      const box = new THREE.Box3().setFromObject(template);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const normalizedScale = 1 / maxDim;

      for (let i = 0; i < 200; i++) {
        const clone = template.clone(true);

        // 50% free, 25% reserved, 25% rented
        const mat = i < 100 ? this.freeMaterial : i < 150 ? this.reservedMaterial : this.rentedMaterial;
        clone.traverse(child => {
          if (child instanceof THREE.Mesh) child.material = mat;
        });

        clone.scale.setScalar(normalizedScale * (0.4 + Math.random() * 0.4));
        clone.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        clone.rotation.set(0, Math.random() * Math.PI * 2, 0);
        this.scene.add(clone);
        this.particles.push(clone);
      }
    });
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.particles.forEach(particle => {
      particle.position.x += Math.sin(particle.position.y + Date.now() * 0.001) * 0.005;
      particle.position.y += Math.cos(particle.position.x + Date.now() * 0.001) * 0.005;
      particle.rotation.y += 0.005;
    });

    this.camera.position.x += (this.mouseX * 10 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 10 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };

  private onMouseMove = (event: MouseEvent): void => {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.dispose();
    this.dom.removeChild(this.el.nativeElement, this.canvas);
  }
}
