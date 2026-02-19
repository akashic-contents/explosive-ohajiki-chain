import * as tl from "@akashic-extension/akashic-timeline";
import * as audio from "../audio";
import type { System } from "../System";
import type { OhajikiState } from "./OhajikiState";
import { BaseState } from "./BaseState";
import type { NiceAward, ComboAward, NarrowEscapeAward } from "../award";
import { ResultWindowE, IlluminationE, MVPItemE } from "../E";
import type { Difficulty } from "../types";

export interface ResultStateParameterObject {
	difficulty: Difficulty;
	worldId: number;
	areaId: number;
	gameClear: boolean;
	niceAward: NiceAward | null;
	comboAward: ComboAward | null;
	narrowEscapeAward: NarrowEscapeAward | null;
}

export class ResultState extends BaseState {
	private difficulty: Difficulty;
	private worldId: number;
	private areaId: number;
	private gameClear: boolean;
	private niceAward: NiceAward | null;
	private comboAward: ComboAward | null;
	private narrowEscapeAward: NarrowEscapeAward | null;

	private nextState: OhajikiState | null;

	private timeline!: tl.Timeline;

	constructor(param: ResultStateParameterObject) {
		super();

		this.difficulty = param.difficulty;
		this.worldId = param.worldId;
		this.areaId = param.areaId;
		this.gameClear = param.gameClear;
		this.niceAward = param.niceAward;
		this.comboAward = param.comboAward;
		this.narrowEscapeAward = param.narrowEscapeAward;
		this.nextState = null;
	}

	enter(system: System): void {
		this.nextState = null;

		system.originStack.push(new g.E({ scene: system.scene }));

		this.timeline = new tl.Timeline(system.scene);

		this.setupUI(system);

		this.timeline.create({})
			.call(() => audio.fadeOutBGM(500))
			.wait(500)
			.call(() => audio.playbackBGM("/assets/common/bgm/result"));

		system.logger.log(`Nice award: ${JSON.stringify(this.niceAward)}`);
		system.logger.log(`Combo award: ${JSON.stringify(this.comboAward)}`);
		system.logger.log(`NarrowEscape award: ${JSON.stringify(this.narrowEscapeAward)}`);
	}

	update(_system: System): OhajikiState | null {
		return this.nextState;
	}

	leave(system: System): void {
		this.timeline.destroy();
		system.originStack.pop();
	}

	private setupUI(system: System): void {
		const scene = system.scene;
		const modeImagePaths = {
			easy: "/assets/ui/result/result_mode_easy.png",
			normal: "/assets/ui/result/result_mode_normal.png",
			hard: "/assets/ui/result/result_mode_hard.png",
			crazy: "/assets/ui/result/result_mode_crazy.png"
		};
		const numberImageAssets: g.ImageAsset[] = [];
		for (let i = 0; i < 10; i++) {
			numberImageAssets.push(scene.asset.getImage("/assets/common/numbers/taskNum_0" + i + ".png"));
		}

		let lastTween: tl.Tween | null = null;

		system.origin!.append(new g.FilledRect({
			scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "#00062B",
			opacity: 0xB3 / 0xFF
		}));

		const resultWindowE = new ResultWindowE({
			scene,
			x: 140,
			y: 32,
			width: 1000,
			height: 216,
			// 演出でスケールする。アンカーの挙動をv2互換にしておく
			anchorX: null,
			anchorY: null,
			backgroundImage: scene.asset.getImage("/assets/ui/cutin/howto_dialog.png"),
			borderWidth: 16,
			message: this.gameClear ?
				scene.asset.getImage("/assets/ui/result/result_mode_all_clear.png") :
				{
					worldId: this.worldId,
					areaId: this.areaId,
					numberImageAssets,
					hyphenImageAsset: scene.asset.getImage("/assets/common/numbers/taskNum_minus.png"),
					reachImageAsset: scene.asset.getImage("/assets/ui/result/result_mode_txt.png")
				},
			difficultyImageAsset: scene.asset.getImage(modeImagePaths[this.difficulty])
		});

		const mvpSpr = new g.Sprite({
			scene,
			x: 530,
			y: 309,
			src: scene.asset.getImage("/assets/ui/result/result_mvp_logo.png")
		});

		const lightImageAssets = [
			"/assets/common/ohajiki/ball_blue.png",
			"/assets/common/ohajiki/ball_aqua.png",
			"/assets/common/ohajiki/ball_green.png",
			"/assets/common/ohajiki/ball_yellow.png",
			"/assets/common/ohajiki/ball_red.png"
		].map(path => scene.asset.getImage(path));

		// 表示上のサイズ。
		const displaySize = 46;
		// ライトの中心座標を渡すため、指示上の座標からのオフセット。
		const ox = displaySize / 2;
		const oy = displaySize / 2;
		const scale = displaySize / lightImageAssets[0].width;
		const illuminatin = new IlluminationE({
			scene,
			lightImageAssets,
			lights: [
				{ x: 142 + ox, y: 338 + oy, id: 0, scale },
				{ x: 218 + ox, y: 338 + oy, id: 1, scale },
				{ x: 293 + ox, y: 338 + oy, id: 2, scale },
				{ x: 369 + ox, y: 338 + oy, id: 4, scale },
				{ x: 445 + ox, y: 338 + oy, id: 3, scale },

				{ x: 789 + ox, y: 338 + oy, id: 3, scale },
				{ x: 864 + ox, y: 338 + oy, id: 4, scale },
				{ x: 940 + ox, y: 338 + oy, id: 2, scale },
				{ x: 1016 + ox, y: 338 + oy, id: 1, scale },
				{ x: 1092 + ox, y: 338 + oy, id: 0, scale }
			]
		});

		resultWindowE.scaleX = 1.25;
		resultWindowE.scaleY = 1.25;
		resultWindowE.opacity = 0;
		resultWindowE.modified();

		const resultWindowTween = this.timeline.create(resultWindowE);
		resultWindowTween
			.scaleTo(1, 1, 500, tl.Easing.easeInQuint)
			.con()
			.fadeIn(500)
			.call(() => audio.playbackSE("/assets/ui/se/arrival"));

		lastTween = resultWindowTween;

		system.origin!.append(mvpSpr);
		system.origin!.append(illuminatin);
		system.origin!.append(resultWindowE);

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "monospace",
			size: 34
		});
		const x = 140;
		let y = 422;

		const slideTargets: g.E[] = [];

		if (this.niceAward) {
			const item = new MVPItemE({
				scene,
				src: scene.asset.getImage("/assets/ui/result/result_score_panel.png"),
				titleImageAsset: scene.asset.getImage("/assets/ui/result/result_mvp_title01.png"),
				x, y,
				font,
				name: this.niceAward.name,
				detailText: `${this.niceAward.num}ナイス`
			});
			slideTargets.push(item);
			system.origin!.append(item);
			y += item.height + 16;
		}

		if (this.comboAward) {
			const item = new MVPItemE({
				scene,
				src: scene.asset.getImage("/assets/ui/result/result_score_panel.png"),
				titleImageAsset: scene.asset.getImage("/assets/ui/result/result_mvp_title02.png"),
				x, y,
				font,
				name: this.comboAward.name,
				detailText: `${this.comboAward.num}連鎖`
			});
			slideTargets.push(item);
			system.origin!.append(item);
			y += item.height + 16;
		}

		if (this.narrowEscapeAward) {
			const item = new MVPItemE({
				scene,
				src: scene.asset.getImage("/assets/ui/result/result_score_panel.png"),
				titleImageAsset: scene.asset.getImage("/assets/ui/result/result_mvp_title03.png"),
				x, y,
				font,
				name: this.narrowEscapeAward.name,
				detailText: `${this.narrowEscapeAward.worldId + 1}-${this.narrowEscapeAward.areaId + 1}クリアの時`
			});
			slideTargets.push(item);
			system.origin!.append(item);
			y += item.height + 16;
		}

		slideTargets.forEach((target, idx) => {
			const goalX = target.x;
			target.x = g.game.width;
			target.modified();
			const tween = this.timeline.create(target);
			tween
				.wait(500 * 2 + 500 * idx)
				.call(() => audio.playbackSE("/assets/ui/se/MVP"))
				.moveTo(goalX, target.y, 1000, tl.Easing.easeOutCubic);

			lastTween = tween;
		});

		if (lastTween) {
			lastTween.call(() => {
				illuminatin.onUpdate.add(() => {
					illuminatin.lights.forEach(light => light.id += 10 / g.game.fps);
					illuminatin.modified();
				});
			});
		}
	}
}
