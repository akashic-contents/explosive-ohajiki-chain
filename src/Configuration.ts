import type { AudioConfig } from "./audio";
import type { Level } from "./Level";
import type { Appearance } from "./entity/BaseGameEntity";
import type { Difficulty } from "./types";

/**
 * おはじきを設置するエリア。
 */
export interface DeployArea {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

/**
 * おはじきををプレイするフィールドのパラメータ。
 */
export interface FieldParameter {
	/** 識別子。 */
	id: string;

	/** おはじきのフィールドを成すコーナー。 */
	corners: number[];

	/** 一方通行の壁のコーナー。 */
	oneWayBorderCorners: number[];

	/** おはじきを設置する領域。 */
	deployArea: DeployArea;

	/** おはじきが一方通行の壁を乗り越える処理がタイムアウトした時の再配置領域。 */
	tossArea: DeployArea;

	/** プレイヤーおはじき設置位置。 */
	strikePosition: { x: number, y: number };
}

/**
 * 爆風パラメータ。
 */
export interface BlastParameter {
	/** 爆発の影響範囲（半径）。 */
	radius: number;

	/** 爆風が周囲のおはじきに与える力。 */
	impulse: number;
}

/**
 * おはじきのパラメータ。
 */
export interface OhajikiParameter {
	/** パラメータを区別するための識別子。 */
	id: string;

	/** おはじきの種類。 現在のところ "ohajiki" のみ。 */
	type: string;

	/** おはじきの見た目。爆発の見た目でもある。 */
	appearance: Appearance;

	/** 半径。 */
	radius: number;

	/** 床との摩擦係数。速度に比例した摩擦力が加わる。 */
	mu: number;

	/** 質量。 */
	mass: number;

	/** 反発係数。 */
	restitution: number;

	/** ライフの範囲。 */
	lifeRange: number[];

	/**
	 * このおはじきにダメージを与えられる物体の type の配列。
	 *
	 * "ohajiki", "border" のいずれかになる。
	 */
	damageSources: string[];

	/** 真の時、爆風からダメージを受ける。 */
	receiveBlastDamage: boolean;

	/** 爆風設定。 */
	blast: BlastParameter;

	/** ノルマ減少量 */
	normaDecrease: number;
}

/**
 * 弾く行為のパラメータ。
 */
export interface StrikeParameter {
	/** 弾く強さに乗じる値。 */
	impulseScale: number;

	/** 弾く強さの上限。 */
	impulseMax: number;
}

/**
 * ゲーム全般のパラメータ。
 */
export interface GeneralPrameter {
	/** 難易度の初期値。 */
	defaultDifficulty: Difficulty;

	/** 投石猶予時間（ミリ秒）。 */
	strikeTimeLimitInMilliSec: number;

	/** ライフが０になったおはじきが爆発するまでの時間（ミリ秒）。 */
	explosionDelayInMilliSec: number;

	initialNumStrikesRemaining: number;

	/** プレイヤーが用いるおはじきのID。 */
	playerOhajikiId: string;

	/** 爆風のダメージ。 */
	blastDamage: number;

	/** １秒あたりの最大ココ数。 */
	maxKokoPerSec: number;
}

/**
 * 準備画面パラメータ。
 */
export interface MatchingParameter {
	/** 参加受付時間[秒] */
	receptionTimeInSec: number;

	howToPlayText: string[][];
}

/**
 * ヒットストップパラメータ。
 */
export interface HitstopParameter {
	/** ヒットストップ発生時間（フレーム数）。 */
	durationInFrame: number;

	/**
	 * ヒットストップ中のタイムステップのスケール。
	 *
	 *  0.1 だと 時間の進み方が 1/10 になる。
	 */
	timeScale: number;
}

export interface OhajikiPhysicsParameter {
	/** 拘束解決処理の繰り返し回数。 */
	iteration: number;

	/** おはじきが静止したとみなす速度。 */
	restTolerance: number;
}

/**
 *  コンボ（爆発連鎖）ボーナス。
 */
export interface ComboBonus {
	/** 透明おはじきを付与する契機となるコンボ序数。 */
	combo: number;
}

/**
 * 透明おはじきパラメータ。
 */
export interface CrystalOhajikiParameter {
	/** 透明おはじきとして用いるおはじきのID。 */
	ohajikiId: string;

	comboBonuses: ComboBonus[];

	/** 真の時、透明おはじきの爆発を爆発数のカウントに加える。 */
	countExplosion: boolean;
}

/**
 * おはじき軌跡パラメータ。
 */
export interface TrailParameter {
	/**
	 * ノードの寿命（フレーム数）
	 *
	 * ノードはおはじきの軌跡の形を決める、おはじきの座標などの記録である。
	 * たとえばおはじきが A, B, C 地点と移動すると、それぞれの座標を記録した３つの
	 * ノードが生成される。ノードは寿命を全うすると削除される。
	 */
	nodeLifeSpanInFrame: number;

	/**
	 * 軌跡が発生する条件となるおはじきの速さ。
	 *
	 * おはじきの速さが occurrenceSpeed 以上になった時、軌跡の生成を開始する。
	 */
	occurrenceSpeed: number;

	/**
	 * 軌跡の最大の長さ。
	 *
	 * 軌跡の長さは次のよう求められる。
	 *
	 * - maxLength が指定された時
	 *     - 軌跡の長さ = 最小値(maxLength, ノードを全て接続した長さ) x lengthScale
	 * - maxLength が省略された時
	 *     - 軌跡の長さ = ノードを全て接続した長さ x lengthScale
	 */
	maxLength?: number;

	/**
	 * 軌跡の長さのスケール。
	 *
	 * 軌跡の長さは次のよう求められる。
	 *
	 * - maxLength が指定された時
	 *     - 軌跡の長さ = 最小値(maxLength, ノードを全て接続した長さ) x lengthScale
	 * - maxLength が省略された時
	 *     - 軌跡の長さ = ノードを全て接続した長さ x lengthScale
	 *
	 * 省略時、 1 。
	 */
	lengthScale?: number;
}

/*
 * 振り子矢印パラメータ。
 */
export interface SwingArrowParameter {
	/** 振り子を振る角速度[deg/s]。 */
	angularVelocity: number;

	/** 振り子の水平方向からの最大角度[deg]。 */
	maxAngle: number;
}

/**
 * 設定。
 */
export interface Configuration {
	general: GeneralPrameter;
	matching: MatchingParameter;
	physics: OhajikiPhysicsParameter;
	worlds: { [key in Difficulty]: Level[][] };
	fields: FieldParameter[];
	ohajikis: OhajikiParameter[];
	strike: StrikeParameter;
	swingArrow: SwingArrowParameter;
	audio: AudioConfig;
	specialBlast: BlastParameter;
	crystalOhajiki: CrystalOhajikiParameter;
	hitstop: HitstopParameter;
	trail: TrailParameter;

	/** デバッグ設定。 */
	debug: {
		/**
		 *  真の時、ログを出力する。
		 *
		 * active instance ではこのフラグによらず常にログを出力することに注意。
		 * see: main.ts
		 */
		enableLog: boolean;
	};
}
