varying vec4 v_Color;

#ifdef ENABLE_LIGHT
varying vec3 v_Normal;
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_AmbientLightColor;
#endif

#ifdef ENABLE_TEXTURE
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
#endif

void main() {
    vec4 toUseColor = v_Color;
    #ifdef ENABLE_TEXTURE
        toUseColor = texture2D(u_Sampler, v_TexCoord);
    #endif
    #ifdef ENABLE_LIGHT
        vec3 normal = normalize(v_Normal);
        vec3 lightDirection = normalize(u_LightDirection);
        float nDotL = max(dot(lightDirection, normal), 0.0);
        vec3 ambient = u_AmbientLightColor * toUseColor.rgb;
        vec3 diffuse = u_LightColor * nDotL * toUseColor.rgb;
        toUseColor = vec4(diffuse + ambient, toUseColor.a);
    #endif
    gl_FragColor = toUseColor;
}
