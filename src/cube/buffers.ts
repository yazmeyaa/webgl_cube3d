//* vec3 array for 8 points
export const COLOR_BUFFER_ARRAY = new Float32Array([
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0,
    1.0, 1.0, 0.0,
    1.0, 0.0, 1.1,
    0.0, 1.0, 1.0,
    1.0, 1.0, 0.0,
    1.0, 0.0, 1.0,
])

//* vec3 array for 8 points
export const VERTEX_POSITION_BUFFER_ARRAY = new Float32Array([
    -0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    -0.8, -0.8, 0.8,
    0.8, -0.8, 0.8,
    -0.8, 0.8, -0.8,
    0.8, 0.8, -0.8,
    -0.8, -0.8, -0.8,
    0.8, -0.8, -0.8,
])

//* Triangles
export const FACES_BUFFER_ARRAY = new Uint16Array([
    0,1,2,
    1,2,3,
    0,1,4,
    4,5,1,
    4,5,6,
    5,6,7,
    1,5,3,
    3,5,7,
    0,4,2,
    2,4,6,
    2,6,3,
    3,6,7,
    ])