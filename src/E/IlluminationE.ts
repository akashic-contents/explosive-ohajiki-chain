export interface Light {
	x: number;
	y: number;
	scale: number;
	id: number;
}

export interface IlluminationEParameterObject extends g.EParameterObject {
	lightImageAssets: g.ImageAsset[];
	lights: Light[];
}

export class IlluminationE extends g.E {
	lights: Light[];

	private lightSurfaces: g.Surface[];

	constructor(param: IlluminationEParameterObject) {
		super(param);

		this.lights = param.lights;
		this.lightSurfaces = param.lightImageAssets.map(asset => asset.asSurface());
	}

	renderSelf(renderer: g.Renderer, _camera?: g.Camera): boolean {

		this.lights.forEach(light => {
			const numLight = this.lightSurfaces.length;
			// 小数や負数の light.id を扱えるようにする。
			// ただし light.id += 0.1 を無限に繰り返すような処理
			// で Infinity になることを避けるため id: [0, numLight) に
			// 収まるようにする。
			light.id = ((light.id % numLight) + numLight) % numLight;
			const id = Math.floor(light.id);
			const surface = this.lightSurfaces[id];

			if (!surface) {
				return;
			}

			renderer.save();

			renderer.transform([
				light.scale, 0,
				0, light.scale,
				light.x, light.y
			]);

			renderer.translate(-surface.width / 2, -surface.height / 2);

			renderer.drawImage(
				surface,
				0, 0,
				surface.width, surface.height,
				0, 0
			);

			renderer.restore();
		});

		return true;
	}
}
