attribute vec3 a_Position;
attribute vec3 a_Color;
varying vec3 v_Color;
uniform mat4 u_Pmatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_Mmatrix;

void main() {
    gl_Position = u_Pmatrix  * u_VMatrix * u_Mmatrix * vec4(a_Position, 1.0);
    v_Color = a_Color;
}