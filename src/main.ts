import CubeVertexShader from "./cube/cube.vert";
import CubeFragmentShader from "./cube/cube.frag";
import {
  COLOR_BUFFER_ARRAY,
  FACES_BUFFER_ARRAY,
  VERTEX_POSITION_BUFFER_ARRAY,
} from "./cube/buffers";
import { mat4, vec3 } from "gl-matrix";

interface CubeBuffers {
  color: WebGLBuffer;
  vertexPosition: WebGLBuffer;
  faces: WebGLBuffer;
}

interface Matrixes {
  model: mat4;
  view: mat4;
  perspective: mat4;
}

interface Shaders {
  fragment: WebGLShader;
  vertex: WebGLShader;
}

interface Attributes_ptr {
  a_Position: number;
  a_Color: number;
}

interface UniformMatrixes_ptr {
  model: WebGLUniformLocation;
  view: WebGLUniformLocation;
  perspective: WebGLUniformLocation;
}

class CubeRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  cube: CubeBuffers;
  matrixes: Matrixes;
  shaders: Shaders;
  attributesPtr: Attributes_ptr;
  program: WebGLProgram;
  uniform_Matrixes: UniformMatrixes_ptr;

  clicked: boolean = false;
  degX: number = 0;
  degY: number = 0;
  oldX: number = 0;
  oldY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) throw new Error("HTMLCanvasElement is not provided!");
    const gl = canvas.getContext("webgl");
    if (!gl) throw new Error("Cannot get webgl rendering context!");
    this.gl = gl;
    this.canvas = canvas;
    this.cube = this.createCubeBuffer();
    this.matrixes = this.createMatrixes();
    this.shaders = this.createShaders();
    this.program = this.createProgram(
      this.shaders.vertex,
      this.shaders.fragment
    );
    this.attributesPtr = this.getAttributesPointers();
    this.uniform_Matrixes = this.getMatrixesUniformLocation();

    this.setupListeners();
    this.play(0);
  }

  private getMatrixesUniformLocation(): UniformMatrixes_ptr {
    const gl = this.gl;
    const u_Pmatrix = gl.getUniformLocation(this.program, "u_Pmatrix");
    const u_VMatrix = gl.getUniformLocation(this.program, "u_VMatrix");
    const u_Mmatrix = gl.getUniformLocation(this.program, "u_Mmatrix");

    if (!u_Pmatrix || !u_VMatrix || !u_Mmatrix)
      throw new Error("Cannot get uniform locations for matrixes");

    return { model: u_Mmatrix, perspective: u_Pmatrix, view: u_VMatrix };
  }

  private createShaders(): Shaders {
    const vertex = this.createShader("vs");
    const fragment = this.createShader("fs");

    const result: Shaders = { vertex, fragment };

    return result;
  }

  private createShader(type: "vs" | "fs"): WebGLShader {
    const gl = this.gl;
    let shader: WebGLShader | null;
    if (type === "fs") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type === "vs") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else throw new Error("Unexpected type of shader");

    if (!shader) throw new Error("Error while createing shader");
    const SHADER_SOURCE = type === "vs" ? CubeVertexShader : CubeFragmentShader;
    gl.shaderSource(shader, SHADER_SOURCE);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error("Error while compile shader");

    return shader;
  }

  private setupListeners() {
    const canvas = this.canvas;

    const listeners: Partial<Record<keyof HTMLElementEventMap, EventListener>> =
      {
        touchstart: this.onMouseDown as EventListener,
        touchend: this.onMouseUp as EventListener,
        touchmove: this.onMouseMove as EventListener,
        mousedown: this.onMouseDown as EventListener,
        mouseup: this.onMouseUp as EventListener,
        mousemove: this.onMouseMove as EventListener,
        mouseleave: this.onMouseLeave as EventListener,
      } as const;

    for (const eventType in listeners) {
      const listener = listeners[eventType as keyof typeof listeners];
      canvas.addEventListener(eventType, listener!.bind(this) as EventListener);
    }
  }

  private onMouseMove(event: TouchEvent | MouseEvent): void {
    
    if(event instanceof MouseEvent) {
      const deltaX = (event.offsetX - this.oldX) * 0.016;
      const deltaY = (event.offsetY - this.oldY) * 0.016;
      
      this.oldX = event.offsetX;
      this.oldY = event.offsetY;
      if(this.clicked) {
        this.degX += deltaX
        this.degY += deltaY
      };
    } else if (event instanceof TouchEvent) {
      const offsetX = event.changedTouches[0].clientX
      const offsetY = event.changedTouches[0].clientY
      const deltaX = (offsetX - this.oldX) * 0.016;
      const deltaY = (offsetY - this.oldY) * 0.016;
      
      this.oldX = offsetX;
      this.oldY = offsetY;
      if(this.clicked) {
        this.degX += deltaX
        this.degY += deltaY
      };
    }
   

  }

  private onMouseDown(event: MouseEvent): void {
    this.clicked = true;
  }

  private onMouseUp(event: MouseEvent): void {
    this.clicked = false;
  }

  private onMouseLeave(event: MouseEvent): void {}

  private createCubeBuffer(): CubeBuffers {
    const gl = this.gl;
    const colorBuffer = gl.createBuffer();
    const vertexPositionBuffer = gl.createBuffer();
    const facesBuffer = gl.createBuffer();

    if (!colorBuffer || !vertexPositionBuffer || !facesBuffer)
      throw new Error("Cannot create buffers for render cube!");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      VERTEX_POSITION_BUFFER_ARRAY,
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, COLOR_BUFFER_ARRAY, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, FACES_BUFFER_ARRAY, gl.STATIC_DRAW);

    const result: CubeBuffers = {
      color: colorBuffer,
      faces: facesBuffer,
      vertexPosition: vertexPositionBuffer,
    };

    return result;
  }

  private createMatrixes(): Matrixes {
    const pMatrix = mat4.create();
    const vMatrix = mat4.create();
    const mMatrix = mat4.create();

    const result: Matrixes = {
      model: mMatrix,
      perspective: pMatrix,
      view: vMatrix,
    };

    return result;
  }

  private clearCanvas(): void {
    this.gl.clearColor(0.6, 0.6, 0.6, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  private createProgram(
    vertShader: WebGLShader,
    fragShader: WebGLShader
  ): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Cannot create program");
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
  }

  private getAttributesPointers(): Attributes_ptr {
    const gl = this.gl;
    const program = this.program;

    const a_Position = gl.getAttribLocation(program, "a_Position");
    const a_Color = gl.getAttribLocation(program, "a_Color");
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    return {
      a_Color,
      a_Position,
    };
  }

  private render() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    this.clearCanvas();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cube.faces);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    gl.flush();
  }

  private update(time: number) {
    const gl = this.gl;
    const { attributesPtr, uniform_Matrixes, matrixes } = this;

    mat4.identity(matrixes.model);
    mat4.identity(matrixes.view);
    mat4.perspective(
      matrixes.perspective,
      45,
      canvas.width / canvas.height,
      0.1,
      100
    );

    mat4.translate(matrixes.view, matrixes.view, [0, 0, -2]);
    mat4.rotateY(matrixes.model, matrixes.model, this.degX);
    mat4.rotateX(matrixes.model, matrixes.model, this.degY);

    // mat4.translate(matrixes.model, matrixes.model, [0, 0, -1.5]);
    mat4.scale(matrixes.model, matrixes.model, [0.5, 0.5, 0.5]);

    gl.uniformMatrix4fv(uniform_Matrixes.model, false, matrixes.model);
    gl.uniformMatrix4fv(uniform_Matrixes.view, false, matrixes.view);
    gl.uniformMatrix4fv(
      uniform_Matrixes.perspective,
      false,
      matrixes.perspective
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cube.vertexPosition);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      VERTEX_POSITION_BUFFER_ARRAY,
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(attributesPtr.a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cube.color);
    gl.bufferData(gl.ARRAY_BUFFER, COLOR_BUFFER_ARRAY, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attributesPtr.a_Color, 3, gl.FLOAT, false, 0, 0);
  }

  private play(time: number) {
    this.update(time);
    this.render();
    window.requestAnimationFrame(this.play.bind(this));
  }
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const cubeRenderer = new CubeRenderer(canvas);
console.log(cubeRenderer);
