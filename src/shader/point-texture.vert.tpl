attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute float a_PointSize;
uniform mat4 u_VPMatrix;
uniform mat4 u_ModelMatrix;
varying vec2 v_TexCoord;

void main() {
    gl_Position = u_VPMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = a_PointSize;
    v_TexCoord = a_TexCoord;
}
