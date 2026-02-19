import type * as tl from "@akashic-extension/akashic-timeline";
import type { PlayerPanelE } from "./PlayerPanelE";

export interface PlayerPanelTrayEParameterObject extends g.EParameterObject {
	playerPanels?: PlayerPanelE[];
}

export class PlayerPanelTrayE extends g.E {

	playerPanels: PlayerPanelE[];

	constructor(param: PlayerPanelTrayEParameterObject) {
		super(param);

		this.playerPanels = [];

		if (param.playerPanels) {
			param.playerPanels.forEach(panel => this.addPanel(panel));
		}
	}

	/**
	 * パネルの追加。
	 *
	 * アニメーションしない。
	 *
	 * @param panel パネル。
	 */
	addPanel(panel: PlayerPanelE): void {
		panel.x = 0;
		panel.y = this.playerPanels.length * 140;
		panel.modified();
		this.append(panel);
		this.playerPanels.push(panel);
	}

	removeTop(tween: tl.Tween): tl.Tween {
		const panel = this.playerPanels.shift();
		if (!panel) {
			return tween;
		}

		const startX = panel.x;
		const offsetX = g.game.width - this.x;

		tween
			.every(
				(e, p) => {
					panel.x = startX + offsetX * p;
					panel.modified();
				},
				250
			)
			.call(() => panel.destroy());

		if (this.playerPanels.length === 0) {
			return tween;
		}

		const offsetY = -140;

		for (let i = 0; i < this.playerPanels.length; i++) {

			const panel = this.playerPanels[i];
			const startY = panel.y;
			tween
				.every(
					(e, p) => {
						panel.y = startY + offsetY * p;
						// console.log(`panel y = ${panel.y}`);
						panel.modified();
					},
					250
				);
		}

		return tween;
	}

	pushPanel(panel: PlayerPanelE, tween: tl.Tween): tl.Tween {
		panel.x = g.game.width - this.x;
		panel.modified();
		this.append(panel);

		this.playerPanels.push(panel);

		const idx = this.playerPanels.length - 1;
		const startX = panel.x;
		const offsetX = -startX;

		tween
			.call(() => {
				panel.y = idx * 140;
				panel.modified();
			})
			.every(
				(e, p) => {
					panel.x = startX + offsetX * p;
					panel.modified();
				},
				250
			);

		return tween;
	}
}
