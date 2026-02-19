/*
 * ステートクラス群で共有する機能。
 */

import type * as msg from "../coeMessages";
import type { System } from "../System";
import { Player } from "../Player";

/**
 * AddPlayerCommand を処理する。
 *
 * Player インスタンスを生成し PlayerManager に登録する。
 *
 * @param context
 * @param command
 */
export function handleAddPlayerCommand(context: System, command: msg.AddPlayerCommand): void {
	const player = new Player(command.player);
	player.isHost = command.isHost;
	player.screenName = command.name;

	// 念の為。
	if (context.playerManager.isBannedPlayer(player.id)) {
		context.logger.log(`Cancel adding a player because it's a banned player. Player: ${JSON.stringify(player)}`);
	} else {
		const result = context.playerManager.addPlayer(player);
		if (result) {
			if (context.inPlayApplyButton && player.id === g.game.selfId) {
				context.inPlayApplyButton.hide();
			}
			context.logger.log(`Add a player. Player: ${JSON.stringify(player)}`);
		} else {
			context.logger.log(`Failed to add a player. Player: ${JSON.stringify(player)}`);
		}
	}
}
