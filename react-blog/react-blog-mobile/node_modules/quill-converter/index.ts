import type Quill from 'quill';
import type {Delta, Op} from 'quill';

/** Quill delta. */
export interface IQuillDelta {
	/** @see Op */
	ops: Op[];
}

const getQuill: () => Quill = typeof document === 'object' ?
	() => {
		const div = document.createElement('div');
		div.style.display = 'none';
		document.body.appendChild(div);
		return new (require('quill').default)(div);
	} :
	() => {
		const fs = eval('require')('fs');
		const path = eval('require')('path');

		const jsdom = eval('require')('jsdom');
		const { JSDOM } = jsdom;

		const quillFilePath = eval('require').resolve('quill');
		const quillDistFilePath = quillFilePath.replace(
			'quill.js',
			path.join('dist', 'quill.js')
		);

		const quillLibrary = fs.readFileSync(quillDistFilePath).toString();

		const JSDOM_TEMPLATE = `
			<div id="editor">hello</div>
			<script>${quillLibrary}</script>
		`;

		const JSDOM_OPTIONS = { runScripts: 'dangerously', resources: 'usable' };
		const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);
		return new DOM.window.Quill('#editor');
	};

let quill: Quill|undefined;

export const convertHtmlToDelta = (html: string) : Delta => {
	if (!quill) {
		quill = getQuill();
	}

	const delta = quill.clipboard.convert({html});
	return delta;
};

export const convertTextToDelta = (text: string) : Delta => {
	if (!quill) {
		quill = getQuill();
	}

	const delta = quill.clipboard.convert({text});
	return delta;
};

export const convertDeltaToHtml = (delta: IQuillDelta | Delta | Op[]) : string => {
	if (!quill) {
		quill = getQuill();
	}

	quill.setContents(<any> delta);

	const html = quill.getSemanticHTML();
	return html;
};

export const convertDeltaToText = (delta: IQuillDelta | Delta | Op[]) : string => {
	if (!quill) {
		quill = getQuill();
	}

	quill.setContents(<any> delta);

	const html = quill.getText();
	return html;
};
