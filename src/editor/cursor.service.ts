import {RefObject} from 'react';

export default class CursorService {
    public moveCursorTo(ref: RefObject<HTMLElement>, position: number) {
        if (!ref || !ref.current) {
            return;
        }
        const el = ref.current;
        if (!el.firstChild) {
            return;
        }

        const selectEl = window.getSelection();
        if (!selectEl) {
            return;
        }

        const range = document.createRange();
        range.setStart(el.firstChild, position);
        range.collapse(true);
        selectEl.removeAllRanges();
        selectEl.addRange(range);
    }

    public getCursorPosition(): number {
        const range = document.getSelection();
        if (!range) {
            return 0;
        }
        return range.getRangeAt(0).startOffset;
    }
}