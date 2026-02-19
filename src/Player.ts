export interface NarrowEscape {
	norma: number;
	worldId: number;
	areaId: number;
}

export class PlayRecord {
	nice: number;
	combo: number;
	narrowEscape: NarrowEscape | null;

	constructor() {
		this.nice = 0;
		this.combo = 0;
		this.narrowEscape = null;
	}
}

export class Player implements g.Player {
	id: string;
	name: string;

	/** 表示名。 */
	screenName: string | null;

	/** ユーザ名 */
	userName: string | null;

	/** 真の時、ゲームを起動したプレイヤー。 */
	isHost: boolean;

	/**
	 * 自動投石した回数。
	 */
	autoStrikeCount: number;

	/** プレイの記録。 */
	playRecord: PlayRecord;

	constructor(player: g.Player);
	constructor(id: string, name?: string);
	constructor(idOrPlayer: string | g.Player, name?: string) {
		if (typeof idOrPlayer === "string") {
			this.id = idOrPlayer;
			this.name = name ?? "";
		} else {
			const player = idOrPlayer;
			this.id = player.id ?? "";
			this.name = player.name ?? "";
		}

		this.screenName = null;
		this.userName = null;
		this.isHost = false;
		this.autoStrikeCount = 0;
		this.playRecord = new PlayRecord();
	}
}
