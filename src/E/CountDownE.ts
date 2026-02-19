export interface CountDownEParameterObject extends g.EParameterObject {
	body: g.ImageAsset;
	numbers: g.ImageAsset[];
	numberArea: g.CommonArea;
	initialNum: number;
}

export class CountDownE extends g.E {
	bodySurface: g.Surface;
	numberSurfaces: g.Surface[];
	numberArea: g.CommonArea;

	initialNum: number;

	animating: boolean;

	timeExpired: g.Trigger<void>;

	private cntr: number;
	private currentNum: number;

	constructor(param: CountDownEParameterObject) {
		param.width = param.width != null ? param.width : param.body.width;
		param.height = param.height != null ? param.height : param.body.height;

		super(param);

		this.bodySurface = param.body.asSurface();
		this.numberSurfaces = param.numbers.map(asset => asset.asSurface());
		this.numberArea = param.numberArea;
		this.initialNum = param.initialNum;
		this.currentNum = param.initialNum;
		this.animating = false;
		this.cntr = 0;
		this.timeExpired = new g.Trigger();

		this.onUpdate.add(() => this.handleUpdate());
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {
		renderer.drawImage(this.bodySurface, 0, 0, this.bodySurface.width, this.bodySurface.height, 0, 0);

		const nums = (this.currentNum + "").split("").map(ch => parseInt(ch, 10));
		const numWidth = nums.map(num => this.numberSurfaces[num].width).reduce((w1, w2) => w1 + w2);
		const y = this.numberArea.y + (this.numberArea.height - this.numberSurfaces[0].height) / 2;
		let x = this.numberArea.x + (this.numberArea.width - numWidth) / 2;

		nums.forEach(num => {
			const surface = this.numberSurfaces[num];
			renderer.drawImage(surface, 0, 0, surface.width, surface.height, x, y);
			x += surface.width;
		});

		return true;
	}

	start(): void {
		this.cntr = 0;
		this.currentNum = this.initialNum;
		this.animating = true;
	}

	stop(): void {
		this.animating = false;
	}

	reset(): void {
		this.cntr = 0;
		this.currentNum = this.initialNum;
		this.animating = false;
	}

	private handleUpdate(): void {
		if (!this.animating) {
			return;
		}

		const duration = (this.initialNum + 1) * g.game.fps;

		this.cntr++;

		const t = this.cntr / duration; // (0, 1]
		this.currentNum = Math.floor((1 - t) * (this.initialNum + 1));

		if (this.cntr >= duration) {
			this.timeExpired.fire();
			this.stop();
			this.modified();
			return;
		}

		this.modified();
	}
}
