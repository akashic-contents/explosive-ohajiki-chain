import type { Ohajiki } from "./Ohajiki";
import type { Border } from "./Border";
import { Arbiter } from "./Arbiter";

/**
 * 衝突を検出しない組み合わせ表。
 */
class IgnoredCollisionTable {
	private table: Record<string, string[]>;

	constructor() {
		this.table = {};
	}

	add(tag1: string, tag2: string): void {
		if (tag1 > tag2) {
			const tmp = tag1;
			tag1 = tag2;
			tag2 = tmp;
		}

		this.table[tag1] = this.table[tag1] || [];

		const table = this.table[tag1];
		if (table.indexOf(tag2) === -1) {
			table.push(tag2);
		}
	}

	exists(tag1: string | undefined, tag2: string | undefined): boolean {
		if (tag1 == null || tag2 == null) {
			return false;
		}

		if (tag1 > tag2) {
			const tmp = tag1;
			tag1 = tag2;
			tag2 = tmp;
		}

		return this.table[tag1] && this.table[tag1].indexOf(tag2) !== -1;
	}
}

/**
 * ワールドコンストラクタパラメータオブジェクト。
 */
export interface WorldParameterObject {
	/** おはじき。 */
	ohajikis?: Ohajiki[];

	/** ボーダー。 */
	borders?: Border[];

	/** 拘束解決処理の繰り返し回数。省略したとき 10 。 */
	iteration?: number;

	/** おはじきが静止したとみなす速度。省略したとき 3 。 */
	restTolerance?: number;
}

/**
 * おはじきワールドクラス。
 */
export class World {
	iteration: number;
	restTolerance: number;

	borders: Border[];
	ohajikis: (Ohajiki | null)[];

	arbiters: Arbiter[];

	ignoredCollisionTable: IgnoredCollisionTable;

	constructor(param: WorldParameterObject = {}) {
		this.iteration = param.iteration || 10;
		this.borders = param.borders || [];
		this.ohajikis = param.ohajikis || [];
		this.restTolerance = typeof param.restTolerance === "number" ? param.restTolerance : 3;
		this.arbiters = [];
		this.ignoredCollisionTable = new IgnoredCollisionTable();
	}

	removeOhajiki(ohajiki: Ohajiki): void {
		const index = this.ohajikis.indexOf(ohajiki);
		if (index !== -1) {
			this.ohajikis[index] = null;
		}
	}

	flush(): void {
		this.ohajikis = this.ohajikis.filter(o => !!o);
	}

	step(dt: number): void {
		this.broadPhase();
		this.preStep(dt);
		this.applyImpulse();
		this.integrateVelocity(dt);
	}

	broadPhase(): void {
		const arbiters: Arbiter[] = [];

		// ohajiki vs ohajiki.
		for (let i = 0; i < this.ohajikis.length - 1; i++) {
			const bodyA = this.ohajikis[i];
			if (!bodyA) {
				continue;
			}
			for (let j = i + 1; j < this.ohajikis.length; j++) {
				const bodyB = this.ohajikis[j];
				if (!bodyB) {
					continue;
				}
				if (this.ignoredCollisionTable.exists(bodyA.tag, bodyB.tag)) {
					continue;
				}
				const arbiter = new Arbiter(bodyA, bodyB);
				if (arbiter.contacts.length > 0) {
					arbiters.push(arbiter);
				}
			}
		}

		// ohajiki vs border.
		for (let i = 0; i < this.ohajikis.length; i++) {
			const bodyA = this.ohajikis[i];
			if (!bodyA) {
				continue;
			}
			for (let j = 0; j < this.borders.length; j++) {
				const bodyB = this.borders[j];
				const arbiter = new Arbiter(bodyA, bodyB);
				if (arbiter.contacts.length > 0) {
					arbiters.push(arbiter);
				}
			}
		}

		// !!! heavy.
		arbiters.forEach(arbiter => {
			for (let i = 0; i < this.arbiters.length; i++) {
				const other = this.arbiters[i];
				if ((arbiter.bodyA === other.bodyA && arbiter.bodyB === other.bodyB) ||
					(arbiter.bodyA === other.bodyB && arbiter.bodyB === other.bodyA)) {
					arbiter.longevity = true;
				}
			}
		});

		this.arbiters = arbiters;
	}

	preStep(dt: number): void {
		for (let i = 0; i < this.arbiters.length; i++) {
			this.arbiters[i].preStep(1 / dt);
		}
	}

	applyImpulse(): void {
		for (let i = 0; i < this.iteration; i++) {
			for (let j = 0; j < this.arbiters.length; j++) {
				this.arbiters[j].applyImpulse();
			}
		}
	}

	integrateVelocity(dt: number): void {
		const restTolerance2 = this.restTolerance * this.restTolerance;

		for (let i = 0; i < this.ohajikis.length; i++) {
			const ohajiki = this.ohajikis[i];
			if (!ohajiki) {
				continue;
			}

			if (ohajiki.velocity.squaredLength() < restTolerance2) {
				ohajiki.velocity.x = 0;
				ohajiki.velocity.y = 0;
				continue;
			}

			if (ohajiki.invMass !== 0) {
				const friction = ohajiki.velocity.clone()
					.normalize()
					.scale(-1 * ohajiki.mu * ohajiki.mass * 9.8 * dt);
				ohajiki.velocity.add(friction);
			}

			ohajiki.position.add(ohajiki.velocity.clone().scale(dt));
		}
	}
}
