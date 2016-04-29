attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute float a_PointSize;
uniform mat4 u_ViewModelMatrix;
varying vec2 v_TexCoord;

void main() {
    gl_Position = u_ViewModelMatrix * a_Position;
    gl_PointSize = a_PointSize;
    v_TexCoord = a_TexCoord;
}
