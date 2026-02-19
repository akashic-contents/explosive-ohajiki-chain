import type { Vector2Like } from "./Vector2Like";

/**
 * 矩形。
 */
export interface Box {
	/**
	 * 矩形の中心の座標。
	 */
	pos: Vector2Like;

	/**
	 * 矩形の縦横の大きさ。
	 */
	size: Vector2Like;
}
