import { Vector3 } from "@babylonjs/core";

export function multiplyVectorWithScalar(vector: Vector3, scalar: number) {
    return vector.multiplyByFloats(scalar, scalar, scalar);
}