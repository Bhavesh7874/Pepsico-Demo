import * as THREE from 'three';

export class CanBuilder {
  
  public static createCan(): THREE.Group {
    const group = new THREE.Group();

    // Dimensions
    const radius = 1.0;
    const height = 3.2;
    const rimRadius = 0.05;

    // Materials
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.3,
    });

    const labelMaterial = new THREE.MeshStandardMaterial({
      map: this.createLabelTexture(),
      metalness: 0.4,
      roughness: 0.4,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    // Body (Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true);
    const body = new THREE.Mesh(bodyGeo, labelMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.name = 'body';
    group.add(body);

    // Top Rim (Torus)
    const topRimGeo = new THREE.TorusGeometry(radius, rimRadius, 16, 64);
    const topRim = new THREE.Mesh(topRimGeo, aluminumMaterial);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = height / 2;
    topRim.name = 'topRim';
    group.add(topRim);

    // Bottom Rim (Torus)
    const bottomRimGeo = new THREE.TorusGeometry(radius, rimRadius, 16, 64);
    const bottomRim = new THREE.Mesh(bottomRimGeo, aluminumMaterial);
    bottomRim.rotation.x = Math.PI / 2;
    bottomRim.position.y = -height / 2;
    bottomRim.name = 'bottomRim';
    group.add(bottomRim);

    // Top Lid (Circle)
    const lidGeo = new THREE.CircleGeometry(radius, 64);
    const lid = new THREE.Mesh(lidGeo, aluminumMaterial);
    lid.rotation.x = -Math.PI / 2;
    lid.position.y = height / 2 - 0.01; // Slightly below rim
    lid.name = 'lid';
    group.add(lid);
    
    // Bottom Cap (Circle)
    const bottomCapGeo = new THREE.CircleGeometry(radius, 64);
    const bottomCap = new THREE.Mesh(bottomCapGeo, aluminumMaterial);
    bottomCap.rotation.x = Math.PI / 2;
    bottomCap.position.y = -height / 2 + 0.01;
    bottomCap.name = 'bottomCap';
    group.add(bottomCap);

    // Tab (Simple Box approximation for now - centered pivot)
    const tabGeo = new THREE.BoxGeometry(0.3, 0.02, 0.5);
    tabGeo.translate(0, 0, 0.25); // Offset pivot
    const tab = new THREE.Mesh(tabGeo, aluminumMaterial);
    tab.position.y = height / 2;
    tab.position.x = 0;
    tab.name = 'tab';
    group.add(tab);

    return group;
  }

  private static createLabelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#00ddeb');
      gradient.addColorStop(1, '#ff0055');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      // Logo Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Vertical text roughly
      ctx.save();
      ctx.translate(512, 512);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('PEPSICO', 10, 50);
      ctx.restore();

      // Details
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('ZERO GRAVITY', 512, 800);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }
}
