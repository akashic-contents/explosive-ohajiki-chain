export interface KokoEParameterObject extends g.FrameSpriteParameterObject {
	centerX: number;
	centerY: number;
}

export class KoKoE extends g.FrameSprite {
	centerX: number;
	centerY: number;

	constructor(param: KokoEParameterObject) {
		super(param);

		this.centerX = param.centerX;
		this.centerY = param.centerY;

		this.onUpdate.add(() => {
			if (this.frameNumber >= this.frames.length - 1) {
				this.destroy();
			}
		});
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		renderer.save();

		// 円の中心がこの E の座標に来るように調整する。
		renderer.translate(-this.centerX, -this.centerY);

		const result = super.renderSelf(renderer, camera);

		renderer.restore();

		return result;
	}
}
