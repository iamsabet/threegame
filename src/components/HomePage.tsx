import { useRef, useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

export const HomePage = () => {
  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refContainer.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer();
      renderer.shadowMap.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (refContainer.current) {
        refContainer.current.appendChild(renderer.domElement);
      }

      // Initialize lighting
      const light = new THREE.DirectionalLight(0xffffff, 1); // white light

      const controls = new OrbitControls(camera, renderer.domElement);
      class Box extends THREE.Mesh {
        height: number;
        width: number;
        depth: number;
        bottom: number;
        top: number;
        left: number;
        right: number;
        back: number;
        front: number;
        velocity: {
          x: number;
          y: number;
          z: number;
        };
        gravity: number;

        constructor({
          color,
          height,
          width,
          depth,
          velocity = {
            x: 0,
            y: 0,
            z: 0,
          },
          position = {
            x: 0,
            y: 0,
            z: 0,
          },
        }: {
          color: THREE.ColorRepresentation | undefined;
          height: number;
          width: number;
          depth: number;
          velocity?: {
            x: number;
            y: number;
            z: number;
          };
          position?: {
            x: number;
            y: number;
            z: number;
          };
        }) {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshStandardMaterial({
            color: color ?? 0x00ff11,
          });
          super(geometry, material);
          this.height = height;
          this.width = width;
          this.depth = depth;
          this.gravity = -0.005;
          this.velocity = velocity;
          this.position.set(position.x, position.y, position.z);
          this.bottom = this.position.y - this.height / 2;
          this.top = this.position.y + this.height / 2;
          this.right = this.position.x + this.width / 2;
          this.left = this.position.x - this.width / 2;
          this.back = this.position.z - this.depth / 2;
          this.front = this.position.z + this.depth / 2;
        }

        updateSides() {
          this.bottom = this.position.y - this.height / 2;
          this.top = this.position.y + this.height / 2;
          this.right = this.position.x + this.width / 2;
          this.left = this.position.x - this.width / 2;
          this.back = this.position.z - this.depth / 2;
          this.front = this.position.z + this.depth / 2;
        }

        update(ground: Box) {
          this.updateSides();
          // console.log(this.bottom, ground.top);
          this.position.x += this.velocity.x;
          this.position.z += this.velocity.z;

          this.applyGravity(ground);
        }

        applyGravity(ground: Box) {
          this.velocity.y += this.gravity;
          const { xCollision, yCollision, zCollision } = boxCollision({
            box1: cube,
            box2: ground,
          });

          if (xCollision && yCollision && zCollision) {
            this.velocity.y = -this.velocity.y;
            this.velocity.y *= 0.45;
          } else {
            this.position.y += this.velocity.y;
          }
        }
      }

      const boxCollision = ({ box1, box2 }: { box1: Box; box2: Box }) => {
        const zCollision = box1.front >= box2.back && box1.back <= box2.front;
        const xCollision = box1.right >= box2.left && box1.left <= box2.right;
        const yCollision =
          box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
        return {
          xCollision,
          yCollision,
          zCollision,
        };
      };

      const cube = new Box({
        height: 1,
        width: 1,
        depth: 1,
        color: 0x00ff11,
        velocity: {
          x: 0,
          y: -0.01,
          z: 0,
        },
        position: {
          x: 0,
          y: 0.5,
          z: 0,
        },
      });

      cube.castShadow = true;
      light.castShadow = true;

      light.position.z = 3;
      light.position.y = 5;
      camera.position.z = 5;

      scene.add(light);
      scene.add(cube);

      const ground = new Box({
        width: 5,
        height: 0.2,
        depth: 100,
        color: 0x0000aa,
        position: {
          x: 0,
          y: -2,
          z: 0,
        },
      });
      ground.receiveShadow = true;
      ground.position.y = -2;
      ground.position.x = 0;
      scene.add(ground);
      let keys = {
        A: {
          pressed: false,
        },
        D: {
          pressed: false,
        },
        W: {
          pressed: false,
        },
        S: {
          pressed: false,
        },
        Space: {
          pressed: false,
        },
      };
      const keyDownHandler = (e: KeyboardEvent) => {
        switch (e.code) {
          case "KeyA":
            keys.A.pressed = true;

            break;
          case "KeyD":
            keys.D.pressed = true;

            break;
          case "KeyW":
            keys.W.pressed = true;

            break;

          case "KeyS":
            keys.S.pressed = true;
            break;
          case "Space":
            keys.Space.pressed = true;
            break;
          default:
            break;
        }
      };
      const keyUpHandler = (e: KeyboardEvent) => {
        switch (e.code) {
          case "KeyA":
            keys.A.pressed = false;

            break;
          case "KeyD":
            keys.D.pressed = false;

            break;
          case "KeyW":
            keys.W.pressed = false;

            break;

          case "KeyS":
            keys.S.pressed = false;
            break;
          case "Space":
            keys.Space.pressed = false;
            break;
          default:
            break;
        }
      };

      window.addEventListener("keydown", keyDownHandler);

      window.addEventListener("keyup", keyUpHandler);

      const animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        cube.update(ground);
        cube.velocity.x = 0;
        cube.velocity.z = 0;

        // left and right
        if (keys.A.pressed && keys.D.pressed) {
        } else if (keys.A.pressed) cube.velocity.x += -0.1;
        else if (keys.D.pressed) cube.velocity.x += 0.1;
        if (keys.S.pressed && keys.W.pressed) {
        }

        // forward and back
        if (keys.S.pressed && keys.W.pressed) {
        } else if (keys.S.pressed) cube.velocity.z += +0.1;
        else if (keys.W.pressed) cube.velocity.z += -0.1;

        if (keys.Space.pressed && Math.abs(cube.bottom - ground.top) < 0.1)
          cube.velocity.y += 0.05;
        // Update controls
        controls.update();

        // Rotate the cube
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
      };

      animate();

      return () => {
        refContainer.current?.removeChild(renderer.domElement);
      };
    }
  }, []);

  return <div ref={refContainer} style={{ width: "100vw", height: "100vh" }} />;
};
