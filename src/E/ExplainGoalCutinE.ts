/**
 *
 */
export interface ExplainGoalCutinEParameterObject extends g.EParameterObject {
	messageImageAsset: g.ImageAsset;
}

/**
 *
 */
export class ExplainGoalCutinE extends g.E {
	private messageImageSurface: g.Surface;

	constructor(param: ExplainGoalCutinEParameterObject) {
		super(param);
		this.messageImageSurface = param.messageImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		renderer.save();

		renderer.opacity(0xB3 / 0xFF);

		renderer.fillRect(0, 0, g.game.width, g.game.height, "#00123F");

		renderer.restore();

		renderer.save();

		renderer.opacity(0xFF / 0xFF);

		renderer.fillRect(0, 285, g.game.width, 150, "#00123F");

		renderer.restore();

		renderer.save();

		renderer.translate(289, 300);

		renderer.drawImage(
			this.messageImageSurface,
			0, 0,
			this.messageImageSurface.width, this.messageImageSurface.height,
			0, 0
		);

		renderer.restore();

		return true;
	}
}
