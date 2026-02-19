// log, info, warn, error は一般に利用できると仮定。
// see: https://caniuse.com/#search=console.error
declare const console: {
	error(...data: any[]): void;
	warn(...data: any[]): void;
	log(...data: any[]): void;
	info(...data: any[]): void;
};

export class Logger {
	error: (...data: any[]) => void;
	warn: (...data: any[]) => void;
	log: (...data: any[]) => void;
	info: (...data: any[]) => void;

	constructor(enableLogging: boolean) {
		if (!console || !enableLogging) {
			this.log = () => { /* */ };
			this.error = () => { /* */ };
			this.info = () => { /* */ };
			this.warn = () => { /* */ };
		} else {
			// developer tool でログの横に現れるソースへのリンクがログ出力関数呼び出し位置になるようにするトリック。
			this.log = (console.log ?? (() => undefined)).bind(console);
			this.error = (console.error ?? console.log).bind(console);
			this.info = (console.info ?? console.log).bind(console);
			this.warn = (console.warn ?? console.log).bind(console);
		}
	}
}
