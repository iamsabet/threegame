import { useRef, useEffect, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

export const HomePage = () => {
  const refContainer = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (refContainer.current) {
      const scene = new THREE.Scene();
      const textureLoader = new THREE.TextureLoader();
      const rockTexture = textureLoader.load(`/rock.png`);
      const woodtexture = textureLoader.load(`/wood.png`);
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
      const light = new THREE.DirectionalLight(0xffffff, 4); // white light
      light.castShadow = true;

      light.position.z = 50;
      light.position.y = 200;
      light.position.x = 50;
      camera.position.z = 6;
      camera.position.y = 3;
      // Initialize lighting
      const light2 = new THREE.DirectionalLight(0xffffff, 4); // white light
      light2.castShadow = false;

      light2.position.z = -100;
      light2.position.y = 50;
      light2.position.x = 0;
      camera.position.z = 6;
      camera.position.y = 3;

      scene.add(light);
      scene.add(light2);
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
        zAcceleration: boolean;
        killable: boolean;
        hero: boolean;

        constructor({
          color,
          height,
          width,
          depth,
          zAcceleration = false,
          killable = false,
          isGround = false,
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
          hero = false,
        }: {
          color: THREE.ColorRepresentation | undefined;
          height: number;
          width: number;
          depth: number;
          isGround?: boolean;
          zAcceleration?: boolean;
          killable?: boolean;
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
          hero?: boolean;
        }) {
          const geometry = hero
            ? new THREE.SphereGeometry(width, 100, 100)
            : new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshStandardMaterial({
            color: !hero ? color ?? 0x00ff11 : undefined,
            map: hero ? rockTexture : !isGround ? woodtexture : undefined,
          });
          super(geometry, material);
          this.hero = hero;
          this.height = height;
          this.width = width;
          this.depth = depth;
          this.gravity = -0.005;
          this.velocity = velocity;
          this.position.set(position.x, position.y, position.z);
          this.zAcceleration = zAcceleration;
          this.killable = killable;
          this.bottom =
            this.position.y -
            (this.hero ? this.width : this.height) / (this.hero ? 1 : 2);
          this.top =
            this.position.y +
            (this.hero ? this.width : this.height) / (this.hero ? 1 : 2);
          this.right = this.position.x + this.width / (this.hero ? 1 : 2);
          this.left = this.position.x - this.width / (this.hero ? 1 : 2);
          this.back =
            this.position.z -
            (this.hero ? this.width : this.depth) / (this.hero ? 1 : 2);
          this.front =
            this.position.z +
            (this.hero ? this.width : this.depth) / (this.hero ? 1 : 2);
        }

        updateSides() {
          this.bottom =
            this.position.y -
            (this.hero ? this.width : this.height) / (this.hero ? 1 : 2);
          this.top =
            this.position.y +
            (this.hero ? this.width : this.height) / (this.hero ? 1 : 2);
          this.right = this.position.x + this.width / (this.hero ? 1 : 2);
          this.left = this.position.x - this.width / (this.hero ? 1 : 2);
          this.back =
            this.position.z -
            (this.hero ? this.width : this.depth) / (this.hero ? 1 : 2);
          this.front =
            this.position.z +
            (this.hero ? this.width : this.depth) / (this.hero ? 1 : 2);
        }

        update(ground: Box) {
          this.updateSides();
          // console.log(this.bottom, ground.top);
          if (this.zAcceleration) this.velocity.z += 0.001;

          this.position.x += this.velocity.x;
          this.position.z += this.velocity.z;

          this.applyGravity(ground);
        }

        applyGravity(ground: Box) {
          this.velocity.y += this.gravity;
          const [xCollision, yCollision, zCollision] = boxCollision({
            box1: this,
            box2: ground,
          });

          if (xCollision && yCollision && zCollision) {
            this.velocity.y = -this.velocity.y;
            this.velocity.y *= 0.5;
          } else {
            this.position.y += this.velocity.y;
          }
        }
      }

      const boxCollision = ({ box1, box2 }: { box1: Box; box2: Box }) => {
        const zCollision =
          box1.front + box1.velocity.z >= box2.back &&
          box1.back + box1.velocity.z <= box2.front;
        const xCollision =
          box1.right + box1.velocity.x >= box2.left &&
          box1.left + box1.velocity.x <= box2.right;
        const yCollision =
          box1.bottom + box1.velocity.y <= box2.top &&
          box1.top + box1.velocity.y >= box2.bottom;
        return [xCollision, yCollision, zCollision];
      };

      const hero = new Box({
        hero: true,
        height: 1, // not important in sphere
        width: 0.45, // works as radius
        depth: 1, // not important in sphere
        color: 0x00ff11,
        velocity: {
          x: 0,
          y: -0.0005,
          z: 0,
        },
        position: {
          x: 0,
          y: 2,
          z: 0,
        },
      });
      hero.castShadow = true;
      scene.add(hero);

      const ground = new Box({
        width: 8,
        height: 1,
        isGround: true,
        depth: 200,
        color: 0x0000aa,
        position: {
          x: 0,
          y: -0.5,
          z: 0,
        },
      });

      ground.receiveShadow = true;

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
      let enemies: Box[] = [];
      const createEnemy = (frames: number) => {
        const xPosition = Math.random() * 7.8 - 3.9; // Random x position between -4 and 4
        const isBlue = Math.random() < 0.2; // 30% chance to be blue and killable
        const addedValueSize = !isBlue
          ? frames / 2000 > 1.2
            ? 1.2
            : frames / 2000
          : 0;
        const enemy = new Box({
          height: 1 + addedValueSize,
          width: 1 + addedValueSize,
          depth: 1 + addedValueSize,
          zAcceleration: true,
          color: isBlue ? 0xffff00 : 0xff0000, // Blue if killable, red if not
          velocity: {
            x: 0,
            y: -0.01,
            z: frames / 10000 + 0.08,
          },
          position: {
            x: xPosition,
            y: 1.0 + addedValueSize,
            z: -60.0,
          },
          killable: isBlue, // Store killable status
        });
        enemy.castShadow = true;
        return enemy;
      };

      const spawnEnemies = (frames: number) => {
        const numberOfEnemies = Math.floor(Math.random() * 3) + 3; // Spawn 2 or 3 enemies
        for (let i = 0; i < numberOfEnemies; i++) {
          const enemy = createEnemy(frames);
          if (i === 0) {
            scene.add(enemy);
            enemies.push(enemy);
          } else if (i === 1) {
            if (enemies.length > 0) {
              const [xCollision, yCollision, zCollision] = boxCollision({
                box1: enemies[enemies.length - 1],
                box2: enemy,
              });

              if (xCollision && yCollision && zCollision) {
              } else {
                scene.add(enemy);
                enemies.push(enemy);
              }
            }
          } else if (i === 2) {
            if (enemies.length > 1) {
              const [xCollision, yCollision, zCollision] = boxCollision({
                box1: enemies[enemies.length - 1],
                box2: enemy,
              });
              const [xCollision2, yCollision2, zCollision2] = boxCollision({
                box1: enemies[enemies.length - 2],
                box2: enemy,
              });
              if (
                (xCollision && yCollision && zCollision) ||
                (xCollision2 && yCollision2 && zCollision2)
              ) {
              } else {
                scene.add(enemy);
                enemies.push(enemy);
              }
            }
          }
        }
      };
      window.addEventListener("keydown", keyDownHandler);

      window.addEventListener("keyup", keyUpHandler);

      let frames = 1;
      let frameRate = 100;

      const animate = function () {
        const animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);

        hero.velocity.x = 0;
        hero.velocity.z = 0;

        // left and right
        if (keys.A.pressed && keys.D.pressed) {
        } else if (keys.A.pressed) hero.velocity.x += -0.12;
        else if (keys.D.pressed) hero.velocity.x += 0.12;

        // forward and back
        if (keys.S.pressed && keys.W.pressed) {
        } else if (keys.S.pressed) hero.velocity.z += +0.12;
        else if (keys.W.pressed) hero.velocity.z += -0.12;

        if (keys.Space.pressed && Math.abs(hero.bottom - ground.top) < 0.1)
          hero.velocity.y += 0.06;

        hero.update(ground);

        // Update camera position to follow the hero along the Z-axis
        const fixedXPosition = 3; // Keep X position fixed
        const fixedYPosition = 3; // Keep Y position fixed
        const distanceBehindhero = 5; // Distance behind the hero along the Z-axis
        camera.position.x = fixedXPosition;
        camera.position.y = fixedYPosition;
        // camera.position.z = hero.position.z + distanceBehindhero;

        // Ensure the camera looks at the hero
        camera.lookAt(hero.position);

        // Update controls
        controls.autoRotate = false;
        controls.update();

        enemies = enemies.filter((enemy) => {
          enemy.update(ground);
          const [xCollision, yCollision, zCollision] = boxCollision({
            box1: hero,
            box2: enemy,
          });
          if (xCollision && yCollision && zCollision) {
            console.log("Collision with enemy");
            if (enemy.killable) {
              setPoints((_points) => _points + 10);
              scene.remove(enemy);
              return false;
            } else {
              const framesPoint = parseInt((frames / 10).toString());
              console.log("Game over! Hit a red enemy.");
              window.cancelAnimationFrame(animationId);
              let element = document.getElementById("p");
              alert(
                "Total Score : " +
                  (framesPoint + (element ? parseInt(element.innerText) : 0))
              );
            }
          }
          if (enemy.position.z > 10) {
            scene.remove(enemy);
            return false;
          }
          return true;
        });

        if (frames % frameRate === 0) {
          for (let threshold = 1000; threshold <= 50000; threshold += 1000) {
            if (frames > threshold && frameRate >= 60) {
              frameRate -= 1;
            }
          }
          spawnEnemies(frames);
        }
        frames += 1;

        hero.rotation.x -= 0.1;
      };

      animate();

      return () => {
        refContainer.current?.removeChild(renderer.domElement);
      };
    }
  }, []);

  return (
    <div
      ref={refContainer}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <div
        className="points"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          padding: "10px",
          fontSize: "18px",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        Points: <span id="p">{points.toLocaleString()}</span>
      </div>
    </div>
  );
};
