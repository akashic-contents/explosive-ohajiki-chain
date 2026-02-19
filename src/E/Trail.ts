import type { Vector2Like } from "../math";
import { Vec2 } from "../math";

export interface TrailPrameterObject extends g.CacheableEParameterObject {
	upperTriangleSrc: g.Surface | g.ImageAsset;
	lowerTriangleSrc: g.Surface | g.ImageAsset;
	gradation: boolean;
}

export interface TrailNode {
	position: Vector2Like;
}

export interface Trail {
	nodes: TrailNode[];
	startWidth: number;
	maxLength?: number;
	lengthScale?: number;
}

export class TrailRenderer extends g.CacheableE {
	trails: Trail[];

	upperTriangleSurface: g.Surface;
	lowerTriangleSurface: g.Surface;
	gradation: boolean;

	constructor(param: TrailPrameterObject) {
		super(param);

		this.trails = [];

		const upperSurface = g.SurfaceUtil.asSurface(param.upperTriangleSrc);
		const lowerSurface = g.SurfaceUtil.asSurface(param.lowerTriangleSrc);
		if (!upperSurface || !lowerSurface) {
			throw new Error("Failed to create surfaces for trail");
		}
		this.upperTriangleSurface = upperSurface;
		this.lowerTriangleSurface = lowerSurface;
		this.gradation = param.gradation;
	}

	renderCache(renderer: g.Renderer, _camera?: g.Camera): void {
		for (let i = 0; i < this.trails.length; i++) {
			this.renderTrail(renderer, this.trails[i]);
		}
	}

	addTrail(trail: Trail): void {
		this.trails.push(trail);
	}

	removeTrail(trail: Trail): void {
		const idx = this.trails.indexOf(trail);
		if (idx !== -1) {
			this.trails.splice(idx, 1);
		}
	}

	private calcNormal(v1: Vec2, v2: Vec2): Vec2 {
		const n1 = new Vec2(-v1.y, v1.x);
		const n2 = new Vec2(-v2.y, v2.x);
		return n1.add(n2).normalize();
	}

	private calcTotalLength(nodes: TrailNode[]): number {
		let len = 0;

		for (let i = 0; i < nodes.length - 1; i++) {
			const p0 = nodes[i].position;
			const p1 = nodes[i + 1].position;
			len += new Vec2(p1).sub(p0).length();
		}

		return len;
	}

	private renderTrail(renderer: g.Renderer, trail: Trail): void {
		const nodes = trail.nodes;
		const startWidth = trail.startWidth;
		const totalLength = this.calcTotalLength(nodes);
		const lengthScale = trail.lengthScale != null ? trail.lengthScale : 1;
		const maxLength = trail.maxLength != null ? Math.min(trail.maxLength, totalLength) : totalLength;
		const trailLength = maxLength * lengthScale;

		let len = 0;

		for (let i = 0; i < nodes.length - 1; i++) {
			if (len >= trailLength) {
				break;
			}

			const p0 = this.getPoint(nodes, i - 1);
			const p1 = this.getPoint(nodes, i);
			let p2 = this.getPoint(nodes, i + 1);
			let p3: Vector2Like | null;

			if (!p0 || !p1 || !p2) {
				continue;
			}

			const v12 = new Vec2(p2).sub(p1);
			let segmentLen = v12.length();
			if (segmentLen === 0) {
				continue;
			}

			if (len + segmentLen <= trailLength) {
				p3 = this.getPoint(nodes, i + 2);
			} else {
				segmentLen = trailLength - len;
				v12.normalize().scale(segmentLen);
				p3 = p2;
				p2 = new Vec2(p1).add(v12);
			}

			if (!p3) {
				continue;
			}

			const v01 = new Vec2(p1).sub(p0);
			const v23 = new Vec2(p3).sub(p2);
			const n1 = this.calcNormal(v01, v12);
			const n2 = this.calcNormal(v12, v23);

			const du = segmentLen / trailLength;
			const dv = du;
			const u0 = len / trailLength;
			const v0 = 1 - u0 - dv;
			const p1Width = (1 - len / trailLength) * startWidth;
			const p2Width = (1 - (len + segmentLen) / trailLength) * startWidth;

			len = Math.min(len + segmentLen, trailLength);

			const o0 = n1.clone().scale(p1Width / 2).add(p1);
			const o1 = n2.clone().scale(p2Width / 2).add(p2);
			const o2 = n2.clone().scale(-p2Width / 2).add(p2);
			const o3 = n1.clone().scale(-p1Width / 2).add(p1);

			let xAxis1;
			let yAxis1;
			if (this.gradation) {
				xAxis1 = o2.clone().sub(o3).scale(1 / (du * this.upperTriangleSurface.width));
				yAxis1 = o0.clone().sub(o3).scale(1 / (dv * this.upperTriangleSurface.height));
			} else {
				xAxis1 = o2.clone().sub(o3).scale(1 / this.upperTriangleSurface.width);
				yAxis1 = o0.clone().sub(o3).scale(1 / this.upperTriangleSurface.height);
			}

			const o1_ = o0.clone().add(o2).sub(o1);

			let xAxis2;
			let yAxis2;
			if (this.gradation) {
				xAxis2 = o2.clone().sub(o1_).scale(1 / (du * this.lowerTriangleSurface.width));
				yAxis2 = o0.clone().sub(o1_).scale(1 / (dv * this.lowerTriangleSurface.height));
			} else {
				xAxis2 = o2.clone().sub(o1_).scale(1 / this.lowerTriangleSurface.width);
				yAxis2 = o0.clone().sub(o1_).scale(1 / this.lowerTriangleSurface.height);
			}

			const m1 = [
				xAxis1.x, xAxis1.y,
				yAxis1.x, yAxis1.y,
				o3.x, o3.y
			];
			const m2 = [
				xAxis2.x, xAxis2.y,
				yAxis2.x, yAxis2.y,
				o1_.x, o1_.y
			];

			renderer.save();

			if (this.gradation) {
				// いちいち save/restore し setTransform でなく transform を用いる。
				// どうも WebGL レンダラーは座標系を Canvas と一致させるためにこっそり
				// Y 軸方向に -1 のスケールを行なっているらしく setTransform を用いると
				// 天地逆の描画結果になってしまう。
				renderer.save();
				renderer.transform(m1);
				renderer.drawImage(
					this.upperTriangleSurface,
					this.upperTriangleSurface.width * u0, this.upperTriangleSurface.height * v0,
					this.upperTriangleSurface.width * du, this.upperTriangleSurface.height * dv,
					0, 0
				);
				renderer.restore();

				renderer.save();
				renderer.transform(m2);
				renderer.drawImage(
					this.lowerTriangleSurface,
					this.lowerTriangleSurface.width * u0, this.lowerTriangleSurface.height * v0,
					this.lowerTriangleSurface.width * du, this.lowerTriangleSurface.height * dv,
					0, 0
				);
				renderer.restore();
			} else {
				renderer.save();
				renderer.transform(m1);
				renderer.drawImage(
					this.upperTriangleSurface,
					0, 0,
					this.upperTriangleSurface.width, this.upperTriangleSurface.height,
					0, 0
				);
				renderer.restore();

				renderer.save();
				renderer.transform(m2);
				renderer.drawImage(
					this.lowerTriangleSurface,
					0, 0,
					this.lowerTriangleSurface.width, this.lowerTriangleSurface.height,
					0, 0
				);
				renderer.restore();
			}

			renderer.restore();
		}
	}

	private getPoint(nodes: TrailNode[], idx: number): Vector2Like | null {
		if (nodes.length < 2) {
			return null;
		}

		let p0: Vector2Like;
		let p1: Vector2Like;

		if (idx < 0) {
			p0 = nodes[1].position;
			p1 = nodes[0].position;
		} else if (idx < nodes.length) {
			return nodes[idx].position;
		} else {
			p0 = nodes[nodes.length - 2].position;
			p1 = nodes[nodes.length - 1].position;
		}

		// Extrapolation.
		const position = (new Vec2(p0)).add(new Vec2(p1).sub(p0).scale(2));

		return position;
	}
}
