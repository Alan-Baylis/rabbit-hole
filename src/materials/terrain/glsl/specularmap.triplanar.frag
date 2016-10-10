float specularStrength;

#ifdef USE_SPECULARMAP

	vec4 texelSpecular = texture2DTriplanar(specularMap);
	specularStrength = texelSpecular.r;

#else

	specularStrength = 1.0;

#endif