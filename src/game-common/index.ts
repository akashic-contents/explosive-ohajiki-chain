/*
 * おはじきゲーム共通処理。
 */
import type { Vector2Like,  Box } from "../math";
import type { World } from "../ohajiki";
import { Border } from "../ohajiki";
import { LinePath, OhajikiE } from "../E";
import type { System } from "../System";
import type { EntityManager } from "../entity-system-2";
import type { Appearance, BaseGameEntity} from "../entity";
import { OhajikiGameEntity } from "../entity";
import type { Level } from "../Level";
import type { OhajikiParameter } from "../Configuration";
import type { Logger } from "../Logger";
import { randomInt } from "../utils";

function createLinepath(r: number, segmentNum: number): Vector2Like[] {
	const path: Vector2Like[] = [];

	for (let i = 0; i < segmentNum + 1; i++) {
		const th = Math.PI * 2 * ((i % segmentNum) / segmentNum);
		const x = Math.cos(th) * r;
		const y = Math.sin(th) * r;
		path.push({ x, y });
	}

	return path;
}

/**
 * 数の配列から座標の配列を生成する。
 *
 * たとえば [12, 47, 3, 14] は [(12, 47), (3, 14)] となる。
 *
 * @param nums 数の配列。
 */
export function createCorners(nums: number[]): Vector2Like[] {
	const corners: Vector2Like[] = [];
	for (let i = 0; i < nums.length; i += 2) {
		corners.push({
			x: nums[i],
			y: nums[i + 1]
		});
	}

	return corners;
}

/**
 * 座標の配列からボーダーの配列を生成する。
 *
 * @param corners 座標の配列。
 */
export function createBorders(corners: Vector2Like[]): Border[] {
	const borders: Border[] = [];

	for (let i = 0; i < corners.length - 1; i++) {
		borders.push(new Border(corners[i], corners[i + 1]));
	}

	return borders;

}

export function createOhajikiE(
	scene: g.Scene, appearance: Appearance, isFixed: boolean,
	life: number, position: Vector2Like, hidden: boolean
): OhajikiE {
	const flashImagePaths: Record<Appearance, string> = {
		normal: "/assets/common/ohajiki/ball_white.png",
		big: "/assets/common/ohajiki/ball_big_white.png",
		crystal: "/assets/common/ohajiki/ball_cleanness_white.png",
	};

	const numberImagePaths = appearance === "big" ?
		[
			"/assets/common/numbers/ballNum_big_00.png",
			"/assets/common/numbers/ballNum_big_01.png",
			"/assets/common/numbers/ballNum_big_02.png",
			"/assets/common/numbers/ballNum_big_03.png",
			"/assets/common/numbers/ballNum_big_04.png",
			"/assets/common/numbers/ballNum_big_05.png",
			"/assets/common/numbers/ballNum_big_06.png",
			"/assets/common/numbers/ballNum_big_07.png",
			"/assets/common/numbers/ballNum_big_08.png",
			"/assets/common/numbers/ballNum_big_09.png"
		] :
		[
			"/assets/common/numbers/ballNum_00.png",
			"/assets/common/numbers/ballNum_01.png",
			"/assets/common/numbers/ballNum_02.png",
			"/assets/common/numbers/ballNum_03.png",
			"/assets/common/numbers/ballNum_04.png",
			"/assets/common/numbers/ballNum_05.png",
			"/assets/common/numbers/ballNum_06.png",
			"/assets/common/numbers/ballNum_07.png",
			"/assets/common/numbers/ballNum_08.png",
			"/assets/common/numbers/ballNum_09.png"
		];

	const numberImageAssets = numberImagePaths.map(path => scene.asset.getImage(path));

	const bodyImagePaths = appearance === "big" ?
		[
			"/assets/common/ohajiki/ball_red_big.png",
			"/assets/common/ohajiki/ball_yellow_big.png",
			"/assets/common/ohajiki/ball_green_big.png",
			"/assets/common/ohajiki/ball_aqua_big.png",
			"/assets/common/ohajiki/ball_blue_big.png"
		] :
		appearance === "normal" ?
			[
				"/assets/common/ohajiki/ball_red.png",
				"/assets/common/ohajiki/ball_yellow.png",
				"/assets/common/ohajiki/ball_green.png",
				"/assets/common/ohajiki/ball_aqua.png",
				"/assets/common/ohajiki/ball_blue.png"
			] :
			[
				"/assets/common/ohajiki/ball_cleanness.png"
			];
	const bodyImageAssets = bodyImagePaths.map(path => scene.asset.getImage(path));
	const iceImageAsset = isFixed ? scene.asset.getImage("/assets/common/ohajiki/ball_fix_ice.png") : undefined;
	const flashImageAsset = scene.asset.getImage(flashImagePaths[appearance]);

	const ohajikiE = new OhajikiE({
		scene: scene,
		x: position.x,
		y: position.y,
		hidden: hidden,
		life: life,
		numberImageAssets,
		bodyImageAssets,
		iceImageAsset,
		flashImageAsset
	});

	return ohajikiE;
}

/**
 * 爆風の範囲内のおはじきに撃力と爆風ダメージを与える。
 *
 * @param world おはじき世界。
 * @param pos 爆心地の座標。
 * @param sources 爆発したおはじきの配列。
 * @param radius 範囲の半径。
 * @param impulse 撃力。
 * @param blastDamage 爆風ダメージ。
 */
export function applyBlast(
	world: World,
	pos: Vector2Like,
	sources: BaseGameEntity[],
	radius: number,
	impulse: number,
	blastDamage: number): void {
	world.ohajikis.forEach(ohajiki => {
		if (!ohajiki) {
			return;
		}

		const ohajikiGameEntity = ohajiki.userData as OhajikiGameEntity;

		// この爆発をおこしたおはじきは爆風を与えない。
		if (sources.indexOf(ohajikiGameEntity) !== -1) {
			return;
		}

		const radiusSum = radius + ohajiki.radius;
		const squaredRadius = radiusSum * radiusSum;
		const direction = ohajiki.position.clone().sub(pos);

		if (direction.squaredLength() > squaredRadius) {
			return;
		}

		if (ohajikiGameEntity.ohajikiE) {
			ohajikiGameEntity.ohajikiE.shake = true;
		}

		ohajikiGameEntity.suspend({impulse: direction.normalize().scale(impulse)});
		ohajikiGameEntity.addBlastDamage(blastDamage);
	});
}

export interface CreateExplosionParameterObject {
	scene: g.Scene;
	x: number;
	y: number;
	blastRadius: number;
}

export function createExplosion(param: CreateExplosionParameterObject): g.E {
	const {
		scene,
		x, y,
		blastRadius
	} = param;

	const hitRadius = blastRadius;
	const segmentNum = 32;
	const thickness = 16;
	const maxRadius = hitRadius + 32;
	const points: Vector2Like[] = [];
	const cssColor = "red";

	const circle = new LinePath({
		scene: scene,
		x, y,
		points,
		thickness,
		cssColor
	});

	const fadeoutDuration = 16;
	let cntr = 0;
	let radius: number;
	circle.onUpdate.add(() => {
		cntr++;

		let opacity = 1;

		const t = cntr / fadeoutDuration;
		radius = hitRadius * (1 - t) + maxRadius * t;
		opacity = 1 - t;

		if (cntr === fadeoutDuration) {
			circle.destroy();
		}

		circle.points = createLinepath(radius, segmentNum);
		circle.opacity = opacity;
		circle.modified();
	});

	return circle;
}

export interface DeployOhajikiParameterObject {
	system: System;
	world: World;
	entityManager: EntityManager<BaseGameEntity>;

	ohajikiParam: OhajikiParameter;
	countExplosion: boolean;

	boxArea: Box;

	root: g.E | g.Scene;
	hidden: boolean;

	logger: Logger;
}

/**
 * 他のおはじきと接触しない位置の時、真。
 *
 * @param world ワールド。
 * @param x X座標。
 * @param y Y座標。
 * @param radius x、y の位置に配置したい物体の半径。
 */
export function isVacantPosition(world: World, x: number, y: number, radius: number): boolean {
	for (let k = 0; k < world.ohajikis.length; k++) {
		const ohajiki = world.ohajikis[k];
		if (!ohajiki) continue;

		const sumRadius = radius + ohajiki.radius;
		const sumRadiusSq = sumRadius * sumRadius;
		const distanceSq = ohajiki.position.clone().sub({ x, y }).squaredLength();

		if (distanceSq < sumRadiusSq) {
			return false;
		}
	}

	return true;
}

/**
 * おはじきの配置。
 *
 * @param num 配置するおはじきの数。
 * @param param 配置に関するパラメータ。
 */
export function deployOhajiki(num: number, param: DeployOhajikiParameterObject): OhajikiGameEntity[] {
	const {
		system, world, entityManager,
		ohajikiParam, countExplosion,
		boxArea, root, hidden,
		logger
	} = param;

	const blastRadius = ohajikiParam.blast.radius;
	const blastImpulse = ohajikiParam.blast.impulse;
	const radius = ohajikiParam.radius;
	const ohajikiGameEntities: OhajikiGameEntity[] = [];

	for (let i = 0; i < num; i++) {
		let position: Vector2Like | undefined;

		for (let j = 0; j < 100; j++) {
			const w = boxArea.size.x - radius * 2;
			const h = boxArea.size.y - radius * 2;
			const x = boxArea.pos.x + (system.rand.generate() - 0.5) * w;
			const y = boxArea.pos.y + (system.rand.generate() - 0.5) * h;
			if (isVacantPosition(world, x, y, radius)) {
				position = { x, y };
				break;
			}
		}

		if (!position) {
			logger.warn("Failed to deploy ohajiki because there's no room.");
			break;
		}

		const ohajikiGameEntity = new OhajikiGameEntity({
			type: ohajikiParam.type,
			world: world,
			system,

			position,
			countExplosion: countExplosion,
			appearance: ohajikiParam.appearance,

			root,
			hidden,

			// フィールド配置用ならあとで調整される。
			life: randomInt(system.rand, ohajikiParam.lifeRange[0], ohajikiParam.lifeRange[1]),

			damageSources: ohajikiParam.damageSources,
			normaDecrease: ohajikiParam.normaDecrease,
			receiveBlastDamage: ohajikiParam.receiveBlastDamage,

			ohajikiParam: {
				mass: ohajikiParam.mass,
				radius: ohajikiParam.radius,
				position,
				mu: ohajikiParam.mu,
				restitution: ohajikiParam.restitution
			},

			blastRadius,
			blastImpulse,

			logger
		});

		entityManager.register(ohajikiGameEntity);

		ohajikiGameEntities.push(ohajikiGameEntity);
	}

	return ohajikiGameEntities;
}

export interface DeployOhajikiForLevelParameterObject {
	system: System;
	world: World;
	entityNamager: EntityManager<BaseGameEntity>;

	ohajikiParams: OhajikiParameter[];

	level: Level;
	boxArea: Box;

	root: g.E | g.Scene;
	hidden: boolean;

	logger: Logger;
}

/**
 * レベル開始時のおはじき配置。
 *
 * @param deployOhajikiForLevelParam
 */
export function deployOhajikiForLevel(deployOhajikiForLevelParam: DeployOhajikiForLevelParameterObject): OhajikiGameEntity[] {
	const {
		system,
		level, boxArea, hidden,
		entityNamager,
		ohajikiParams, world,
		root,
		logger
	} = deployOhajikiForLevelParam;

	const ohajikiGameEntities: OhajikiGameEntity[] = [];

	level.deployedOhajikis.forEach(deployedOhajiki => {
		const ohajikiParam = ohajikiParams.filter(param => param.id === deployedOhajiki.ohajikiId)[0];
		if (!ohajikiParam) {
			logger.error(`Failed to deploy ohajiki because ${deployedOhajiki.ohajikiId} not found`);
			return;
		}

		const newOhajikis = deployOhajiki(deployedOhajiki.num, {
			system,
			world,
			entityManager: entityNamager,
			ohajikiParam,
			countExplosion: true,
			boxArea,
			root,
			hidden,
			logger
		});

		Array.prototype.push.apply(
			ohajikiGameEntities,
			newOhajikis
		);
	});

	// deployOhajiki はランダムにおはじきのライフを設定するが、
	// フィールドの配置ではそれを使わず、別のルールで設定する。

	ohajikiGameEntities.forEach(entity => {
		if (entity.ohajikiE) {
			entity.ohajikiE.life = 1;
		}
	});

	const remainLife = level.deployedOhajikiTotalLife - ohajikiGameEntities.length;

	if (remainLife < 0) {
		logger.error("Too small deployedOhajikiTotalLife");
		return ohajikiGameEntities;
	}

	const ratioBases = ohajikiGameEntities.map(() => randomInt(system.rand, 0, 100));

	system.logger.info(`Life dice: ${JSON.stringify(ratioBases)}`);

	const total = ratioBases.reduce((v1, v2) => v1 + v2);
	const ratios = ratioBases.map(v => v / total);
	const lives = ratios.map(v => v * remainLife);

	for (let i = 0; i < lives.length; i++) {
		const life = lives[i];
		lives[i] = Math.round(lives[i]);
		const err = lives[i] - life;
		const remain = lives.length - i - 1;
		for (let j = 0; j < remain; j++) {
			lives[i + 1 + j] -= err / remain;
		}
	}

	for (let i = 0; i < ohajikiGameEntities.length; i++) {
		if (ohajikiGameEntities[i].ohajikiE) {
			ohajikiGameEntities[i].ohajikiE.life += lives[i];
		}
	}

	const totalLife = ohajikiGameEntities
		.map(e => e.ohajikiE ? e.ohajikiE.life : 0)
		.reduce((v1, v2) => v1 + v2);

	if (totalLife !== level.deployedOhajikiTotalLife) {
		system.logger.warn(`Life error. error = ${totalLife - level.deployedOhajikiTotalLife}`);
	}

	return ohajikiGameEntities;
}
