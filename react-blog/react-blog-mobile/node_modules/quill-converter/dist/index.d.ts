import type { Delta, Op } from 'quill';
/** Quill delta. */
export interface IQuillDelta {
    /** @see Op */
    ops: Op[];
}
export declare const convertHtmlToDelta: (html: string) => Delta;
export declare const convertTextToDelta: (text: string) => Delta;
export declare const convertDeltaToHtml: (delta: IQuillDelta | Delta | Op[]) => string;
export declare const convertDeltaToText: (delta: IQuillDelta | Delta | Op[]) => string;
