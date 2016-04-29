attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
uniform mat4 u_ViewModelMatrix;

void main() {
    gl_Position = u_ViewModelMatrix * a_Position;
    v_TexCoord = a_TexCoord;
}
