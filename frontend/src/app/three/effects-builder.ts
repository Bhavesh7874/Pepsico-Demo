import * as THREE from 'three';

export class EffectsBuilder {

  public static createAmbientDust(count: number = 200): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const radius = 6;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * radius * 2;
      const y = (Math.random() - 0.5) * radius * 2;
      const z = (Math.random() - 0.5) * radius * 2;
      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }
}
