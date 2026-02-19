// 通常このファイルを編集する必要はありません。ゲームの処理は main.js に記述してください
import type { GameMainParameterObject } from "./parameterObject";
import { main } from "./main";

export = (originalParam: g.GameMainParameterObject) => {
	const param: any = {} as GameMainParameterObject;
	Object.keys(originalParam).forEach(key => {
		param[key] = (originalParam as any)[key];
	});
	// セッションパラメーター
	param.sessionParameter = {};

	const limitTickToWait = 3 * 10; // セッションパラメーターが来るまでに待つtick数

	const scene = new g.Scene({
		game: g.game
	});
	// セッションパラメーターを受け取ってゲームを開始します
	scene.onMessage.add((msg) => {
		if (msg.data && msg.data.type === "start" && msg.data.parameters) {
			param.sessionParameter = msg.data.parameters; // sessionParameterフィールドを追加
			g.game.popScene();
			main(param);
		}
	});
	scene.onLoad.add(() => {
		let currentTickCount = 0;
		scene.onUpdate.add(() => {
			currentTickCount++;
			// 待ち時間を超えた場合はゲームを開始します
			if (currentTickCount > limitTickToWait) {
				g.game.popScene();
				main(param);
			}
		});
	});
	g.game.pushScene(scene);
};
