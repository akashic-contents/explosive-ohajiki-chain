import { Logger } from "../Logger";

/**
 * オーディオ設定。
 */
export interface AudioConfig {
	/**
	 * 音量設定。
	 *
	 * オーディオアセット名と音量(0~1) のペアを列挙する。
	 */
	volumes: Record<string, number>;
}

let config: AudioConfig;
let logger: Logger;

interface FadeParam {
	endVolume: number;
	startVolume: number;
	duration: number;
	elapse: number;
}

interface BGMSpeaker {
	player: g.AudioPlayer;
	fadeParam?: FadeParam;
}

let currentBGM: BGMSpeaker | null;

/**
 * オーディオアセットのフルパスを取得する。
 *
 * @param audioAsset オーディオアセット
 * @returns オーディオアセットのフルパス
 */
function getAudioPath(audioAsset: g.AudioAsset): string {
	return "/" + audioAsset.id;
}

/**
 * ボリュームの調整。
 *
 * ボリュームを与えた時、そのボリュームに設定する。
 * ボリュームが与えられなかった時、コンフィグの値に設定する。
 * コンフィグにボリューム設定がない時、ボリュームを 1 にする。
 *
 * NOTE: 何も指定されない時 1 とするパスがないと、試合からリザルトに遷移した時リザルトBGMが再生されなかった。
 *
 * @param player
 * @param volume
 */
function tweakVolume(player: g.AudioPlayer, volume?: number): void {
	if (!player || !player.currentAudio) {
		return;
	}

	volume = volume != null ? volume : config.volumes[getAudioPath(player.currentAudio)];
	volume = typeof volume === "number" ? volume : 1;
	player.changeVolume(volume);
}

/**
 * オーディオシステムの初期化。
 *
 * @param config
 */
export function init(_config: AudioConfig, _logger: Logger) {
	config = _config;
	logger = _logger || new Logger(false);
}

/**
 * 更新関数。
 *
 * BGMのフェードイン・フェードアウトを扱う。
 *
 * @param dt 経過時間 [ms]。
 */
export function update(dt: number): void {
	if (!currentBGM) {
		return;
	}

	if (currentBGM.fadeParam) {
		const fadeParam = currentBGM.fadeParam;
		fadeParam.elapse += dt;

		const t = Math.min(fadeParam.elapse / fadeParam.duration, 1);
		const volume = fadeParam.startVolume * (1 - t) + fadeParam.endVolume * t;
		currentBGM.player.changeVolume(volume);

		if (t === 1) {
			currentBGM.fadeParam = undefined;
		}
	}
}

/**
 * BGMのフェードイン開始。
 *
 * @param duration 所要時間 [ms]
 */
export function fadeOutBGM(duration: number): void {
	if (! currentBGM) {
		return;
	}

	currentBGM.fadeParam = {
		endVolume: 0,
		startVolume: currentBGM.player.volume,
		duration: duration,
		elapse: 0
	};
}

/**
 * SEを再生する。
 *
 * @param audioPath アセットパス。
 * @param volume ボリューム。指定しないとき、規定値。
 */
export function playbackSE(audioPath: string, volume?: number): g.AudioPlayer | null {
	const asset = g.game.scene()!.asset.getAudio(audioPath);
	if (!asset) {
		return null;
	}

	const player = asset.play();
	tweakVolume(player, volume);

	return player;
}

/**
 * BGMの再生を停止する。
 */
export function stopBGM(): void {
	if (currentBGM) {
		currentBGM.player.stop();
		currentBGM = null;
	}
}

/**
 * BGMを再生する。
 *
 * 再生中のBGMがある時、停止する。
 * 再生中のBGMと再生したいBGMが同じ時、何もしない。
 *
 * @param audioPath アセットパス。
 * @param volume ボリューム。指定しないとき、規定値。
 */
export function playbackBGM(audioPath: string, volume?: number): g.AudioPlayer | null {

	if (currentBGM) { // 再生中かもしれない。
		const currentBGMPlayer = currentBGM.player;
		if (currentBGMPlayer.currentAudio && getAudioPath(currentBGMPlayer.currentAudio) === audioPath) {
			return currentBGMPlayer;
		}
	}

	stopBGM();

	const audioAsset = g.game.scene()!.asset.getAudio(audioPath);
	if (!audioAsset) {
		logger.warn(`Audio asset ${audioPath} not found`);
		return null;
	}

	currentBGM = {
		player: audioAsset.play()
	};

	tweakVolume(currentBGM.player, volume);

	return currentBGM.player;
}
