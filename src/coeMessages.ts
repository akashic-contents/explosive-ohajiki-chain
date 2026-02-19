import type { Vector2Like } from "./math";
import type { SerializedSystem } from "./System";
import type { Difficulty } from "./types";
import type { NiceAward, ComboAward, NarrowEscapeAward } from "./award";

//
// アクション。
//

export interface SelectDifficultyActionData {
	type: "select-difficulty";
	difficulty: Difficulty;
}

export interface ApplyActionData {
	type: "apply";
	isHost: boolean;
	name: string;
}

export interface StartIntroductionData {
	type: "start-introduction";
	difficulty: Difficulty;
}

export interface StartGameActionData {
	type: "start-game";
}

export interface StrikeActionData {
	type: "strike";
	impulse: Vector2Like;
	autoStrike: boolean;
}

export interface GameClearActionData {
	type: "game-clear";
	serialized: SerializedSystem;
}

export interface GameOverActionData {
	type: "game-over";
	serialized: SerializedSystem;
}

export interface LevelClearActionData {
	type: "level-clear";
	serialized: SerializedSystem;
}

export interface LevelClearMultiActionData {
	type: "level-clear-multi";
	serialized: SerializedSystem;
}

export interface GoNextLevelActionData {
	type: "go-next-level";
	serialized: SerializedSystem;
}

export interface GoNextTurnActionData {
	type: "go-next-turn";
	serialized: SerializedSystem;
}

export interface KokoActionData {
	type: "koko";
	x: number;
	y: number;
}

export interface NiceActionData {
	type: "nice";
	x: number;
	y: number;
}

export interface GoResultActionData {
	type: "go-result";
	difficulty: Difficulty;
	worldId: number;
	areaId: number;
	niceAward: NiceAward | null;
	comboAward: ComboAward | null;
	narrowEscapeAward: NarrowEscapeAward | null;
}

/**
 * おはじきアクション。
 */
export type OhajikiActionData =
	SelectDifficultyActionData |
	ApplyActionData |
	StartIntroductionData |
	StartGameActionData |
	StrikeActionData |
	GameClearActionData |
	GameOverActionData |
	LevelClearActionData |
	LevelClearMultiActionData |
	GoNextLevelActionData |
	GoNextTurnActionData |
	KokoActionData |
	GoResultActionData |
	NiceActionData;

//
// コマンド。
//

export interface SelectDifficultyCommand {
	type: "select-difficulty";
	difficulty: Difficulty;
}

export interface AddPlayerCommand {
	type: "add-player";
	player: g.Player;
	isHost: boolean;
	name: string;
}

export interface StartMatchingCommand {
	type: "start-matching";
}

export interface StartIntroductionCommand {
	type: "start-introduction";
	difficulty: Difficulty;
}

export interface StartGameCommand {
	type: "start-game";
}

export interface StrikeCommand {
	type: "strike";
	impulse: Vector2Like;
	autoStrike: boolean;
}

export interface GameClearCommand {
	type: "game-clear";
	serialized: SerializedSystem;
}

export interface GameOverCommand {
	type: "game-over";
	serialized: SerializedSystem;
}

export interface LevelClearCommand {
	type: "level-clear";
	serialized: SerializedSystem;
}

export interface LevelClearMultiCommand {
	type: "level-clear-multi";
	serialized: SerializedSystem;
}

export interface GoNextLevelCommand {
	type: "go-next-level";
	serialized: SerializedSystem;
}

export interface GoNextTurnCommand {
	type: "go-next-turn";
	serialized: SerializedSystem;
}

export interface KokoCommand {
	type: "koko";
	userId: string;
	x: number;
	y: number;
}

export interface NiceCommand {
	type: "nice";
	x: number;
	y: number;
}

export interface GoResultCommand {
	type: "go-result";
	difficulty: Difficulty;
	worldId: number;
	areaId: number;
	niceAward: NiceAward | null;
	comboAward: ComboAward | null;
	narrowEscapeAward: NarrowEscapeAward | null;
}

/**
 * おはじきコマンド。
 */
export type OhajikiCommand =
	SelectDifficultyCommand |
	StartMatchingCommand |
	StartIntroductionCommand |
	StartGameCommand |
	AddPlayerCommand |
	StrikeCommand |
	GameClearCommand |
	GameOverCommand |
	LevelClearCommand |
	LevelClearMultiCommand |
	GoNextLevelCommand |
	GoNextTurnCommand |
	KokoCommand |
	NiceCommand |
	GoResultCommand;
