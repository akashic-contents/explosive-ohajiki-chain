export interface NiceButtonEParameterObject extends g.EParameterObject {
	normalImageAsset: g.ImageAsset;
	highlightedImageAsset: g.ImageAsset;
	disabledImageAsset: g.ImageAsset;
}

export class NiceButtonE extends g.E {
	clicked: g.Trigger<void>;
	disabled: boolean;

	private highlighted: boolean;
	private normalSurface: g.Surface;
	private highlightedSurface: g.Surface;
	private disableSurface: g.Surface;

	constructor(param: NiceButtonEParameterObject) {
		param.width = param.normalImageAsset.width;
		param.height = param.normalImageAsset.height;
		param.touchable = typeof param.touchable === "boolean" ? param.touchable : true;

		super(param);

		this.clicked = new g.Trigger<void>();
		this.disabled = false;
		this.highlighted = false;

		this.normalSurface = param.normalImageAsset.asSurface();
		this.highlightedSurface = param.highlightedImageAsset.asSurface();
		this.disableSurface = param.disabledImageAsset.asSurface();

		this.onPointDown.add(_ev => {
			this.highlighted = true;
		});

		this.onPointUp.add(ev => {
			if (0 <= ev.point.x && ev.point.x <= this.width &&
				0 <= ev.point.y && ev.point.y <= this.height &&
				!this.disabled) {
				this.clicked.fire();
			}
			this.highlighted = false;
		});
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		const surface =
			this.disabled ? this.disableSurface :
				this.highlighted ? this.highlightedSurface :
					this.normalSurface;

		renderer.save();

		renderer.drawImage(
			surface,
			0, 0,
			surface.width, surface.height,
			0, 0
		);

		renderer.restore();

		return true;
	}
}
