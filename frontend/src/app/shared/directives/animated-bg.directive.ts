import { Directive, effect, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { PrivateLayoutService } from 'src/app/layouts/private-layout/shared';
import * as THREE from 'three';

@Directive({
  selector: '[animatedBg]',
})
export class AnimatedBgDirective implements OnInit, OnDestroy {
  readonly layoutService = inject(PrivateLayoutService);

  private canvas!: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: THREE.Mesh[] = [];
  private material!: THREE.MeshStandardMaterial;
  private ambientLight!: THREE.AmbientLight;
  private pointLight!: THREE.PointLight;
  private animationFrameId!: number;
  private mouseX = 0;
  private mouseY = 0;

  private currentColor = new THREE.Color(0xffffff);
  private targetColor = new THREE.Color(0xffffff);

  constructor(
    private el: ElementRef,
    private dom: Renderer2,
  ) {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--p-emerald-400');
    const red = getComputedStyle(root).getPropertyValue('--p-red-600');

    effect(() => {
      const dark = this.layoutService.isDarkTheme();
      if (this.ambientLight) this.ambientLight.intensity = dark ? 0.1 : 1;
      if (this.pointLight) this.pointLight.power = dark ? 100 : 600;

      this.targetColor.setStyle(dark ? red : primary);
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

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/Swiborg.jpg');
    const geometry = new THREE.SphereGeometry(0.2, 24, 24);
    this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textureMaterial = new THREE.MeshStandardMaterial({ map: texture });

    for (let i = 0; i < 200; i++) {
      const useTexture = Math.random() < 0.01;
      const material = useTexture ? textureMaterial : this.material;
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
      this.scene.add(particle);
      particle.rotation.y = Math.PI / -2;
      this.particles.push(particle);
    }

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.pointLight = new THREE.PointLight(0xffffff, 1);
    this.pointLight.position.set(5, 5, 5);
    this.pointLight.power = 100;
    this.scene.add(this.ambientLight, this.pointLight);

    this.camera.position.z = 20;
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.particles.forEach(particle => {
      particle.position.x += Math.sin(particle.position.y + Date.now() * 0.001) * 0.005;
      particle.position.y += Math.cos(particle.position.x + Date.now() * 0.001) * 0.005;
    });

    this.camera.position.x += (this.mouseX * 10 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 10 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.currentColor.lerp(this.targetColor, 0.05);
    this.material.color.copy(this.currentColor);

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
