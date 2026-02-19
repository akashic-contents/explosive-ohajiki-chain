export interface InPlayApplyButonParameterObject extends g.EParameterObject {
	buttonImageAsset: g.ImageAsset;
	buttonPushedImageAsset: g.ImageAsset;
}

export class InPlayApplyButton extends g.E {

	get pushed() {
		return this._pushed;
	}
	set pushed(v: boolean) {
		this._pushed = v;
		this.modified();
	}

	private _pushed: boolean;
	private buttonSurface: g.Surface;
	private buttonPushedSurface: g.Surface;

	constructor(param: InPlayApplyButonParameterObject) {
		param.width = param.width != null ?
			param.width :
			param.buttonImageAsset.width;
		param.height = param.height != null ?
			param.height :
			param.buttonImageAsset.height;

		super(param);

		this._pushed = false;
		this.buttonSurface = param.buttonImageAsset.asSurface();
		this.buttonPushedSurface = param.buttonPushedImageAsset.asSurface();
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		const surface = this.pushed ? this.buttonPushedSurface : this.buttonSurface;

		renderer.drawImage(
			surface,
			0, 0,
			surface.width, surface.height,
			0, 0
		);

		return true;
	}
}
