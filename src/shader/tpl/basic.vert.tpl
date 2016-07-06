attribute vec4 a_Position;
attribute float a_PointSize;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform mat4 u_MVPMatrix;

#ifdef ENABLE_LIGHT
attribute vec4 a_Normal;
varying vec3 v_Normal;
uniform mat4 u_NormalMatrix;
#endif

#ifdef ENABLE_TEXTURE
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
#endif

void main() {
    gl_Position = u_MVPMatrix * a_Position;
    v_Color = a_Color;
    #ifdef ENABLE_LIGHT
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    #endif

    #ifdef ENABLE_TEXTURE
        v_TexCoord = a_TexCoord;
    #endif

    gl_PointSize = a_PointSize;
}
