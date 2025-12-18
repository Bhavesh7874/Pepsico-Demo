import * as THREE from 'three';

export class TruckBuilder {
  public static createTruck(): THREE.Group {
    const truckGroup = new THREE.Group();

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const cabPaintMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.2, metalness: 0.6 }); // Red Truck
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
    const glassMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x88ccff, 
      transmission: 0.5, 
      opacity: 0.7, 
      transparent: true,
      roughness: 0 
    });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const lightYellowMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const lightRedMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // --- CABIN ---
    // 1. Lower Cab Chassis
    const cabChassisGeo = new THREE.BoxGeometry(2, 0.5, 1.2);
    const cabChassis = new THREE.Mesh(cabChassisGeo, chassisMat);
    cabChassis.position.set(1.5, 0.5, 0); // Offset to front
    truckGroup.add(cabChassis);

    // 2. Main Cab Body
    const cabBodyGeo = new THREE.BoxGeometry(1.2, 1.5, 1.2);
    const cabBody = new THREE.Mesh(cabBodyGeo, cabPaintMat);
    cabBody.position.set(1.5, 1.5, 0);
    truckGroup.add(cabBody);

    // 3. Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1, 0.6);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(2.11, 1.8, 0);
    windshield.rotation.y = Math.PI / 2;
    truckGroup.add(windshield);

    // 4. Headlights
    const headlightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    
    const hLeft = new THREE.Mesh(headlightGeo, lightYellowMat);
    hLeft.rotation.z = Math.PI / 2;
    hLeft.position.set(2.1, 0.8, 0.4);
    truckGroup.add(hLeft);

    const hRight = new THREE.Mesh(headlightGeo, lightYellowMat);
    hRight.rotation.z = Math.PI / 2;
    hRight.position.set(2.1, 0.8, -0.4);
    truckGroup.add(hRight);


    // --- TRAILER ---
    // 1. Trailer Body
    const trailerGeo = new THREE.BoxGeometry(4.5, 2, 1.3);
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(-1.5, 1.5, 0);
    truckGroup.add(trailer);
    
    // Branding Stick on Trailer?
    // Kept simple for now

    // 2. Connector
    const connGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
    const connector = new THREE.Mesh(connGeo, chassisMat);
    connector.rotation.z = Math.PI / 2;
    connector.position.set(0.5, 0.5, 0);
    truckGroup.add(connector);


    // --- WHEELS ---
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    wheelGeo.rotateX(Math.PI / 2); // Rotate to roll

    const createWheel = (x: number, z: number) => {
        const w = new THREE.Mesh(wheelGeo, rubberMat);
        w.position.set(x, 0.4, z);
        
        // Rim
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.31, 16), rimMat);
        rim.rotation.x = Math.PI / 2;
        w.add(rim);

        return w;
    };

    // Cab Wheels
    truckGroup.add(createWheel(2, 0.6));
    truckGroup.add(createWheel(2, -0.6));
    
    // Rear Cab Wheels
    truckGroup.add(createWheel(0.8, 0.6));
    truckGroup.add(createWheel(0.8, -0.6));

    // Trailer Wheels (Rear)
    truckGroup.add(createWheel(-2.5, 0.6));
    truckGroup.add(createWheel(-2.5, -0.6));
    truckGroup.add(createWheel(-3.3, 0.6));
    truckGroup.add(createWheel(-3.3, -0.6));

    // Scale down to fit scene
    truckGroup.scale.set(0.5, 0.5, 0.5);

    return truckGroup;
  }
}
