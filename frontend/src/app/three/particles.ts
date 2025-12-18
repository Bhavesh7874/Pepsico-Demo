import * as THREE from 'three';

export class ParticleSystem {
  private mesh: THREE.InstancedMesh;
  private particleCount: number;
  private dummy: THREE.Object3D;
  private positions: Float32Array;
  private speeds: Float32Array;

  constructor(count: number = 1000) {
    this.particleCount = count;
    this.dummy = new THREE.Object3D();

    // Geometry & Material
    const geometry = new THREE.IcosahedronGeometry(0.05, 0); // Low poly crystal/bubble
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x00ddeb,
      metalness: 0.1,
      roughness: 0.0,
      transmission: 1.0,  // Glass-like
      thickness: 0.5,
      transparent: true,
      opacity: 0.8
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.positions = new Float32Array(count * 3);
    this.speeds = new Float32Array(count);

    this.initParticles();
  }

  private initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      // Start inside the can (roughly)
      const r = (Math.random() - 0.5) * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const y = (Math.random() - 0.5) * 3;
      const z = r * Math.sin(theta);

      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      this.speeds[i] = 0.01 + Math.random() * 0.02;

      this.dummy.position.set(x, y, z);
      this.dummy.scale.setScalar(0); // Invisible start
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  public getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }

  // Called each frame to simulate float/explosion
  public update(time: number, explodeFactor: number = 0) {
    for (let i = 0; i < this.particleCount; i++) {
      // Base float
      let x = this.positions[i * 3];
      let y = this.positions[i * 3 + 1];
      let z = this.positions[i * 3 + 2];

      // Explode outward based on factor
      x += (x * explodeFactor * 2);
      y += (y * explodeFactor * 2);
      z += (z * explodeFactor * 2);

      // Spin
      const s = this.speeds[i];

      this.dummy.position.set(x, y + Math.sin(time + i) * 0.1, z);

      // Scale up based on explode
      const scale = explodeFactor > 0 ? 1 : 0;
      this.dummy.scale.setScalar(scale * (0.5 + Math.random() * 0.5));

      this.dummy.rotation.set(time * s, time * s, time * s);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
