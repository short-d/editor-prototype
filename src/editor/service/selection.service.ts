import {ICursor} from '../entity/cursor';

export class SelectionService {
    getSelection(): Range | null {
        const selection = document.getSelection();
        if (!selection) {
            return null;
        }

        return selection.getRangeAt(0);
    }

    getSelectionBoundingBox(): DOMRect | null {
        const range = this.getSelection();
        if (!range) {
            return null;
        }

        if (!this.hasSelection(range)) {
            return null;
        }
        return range.getBoundingClientRect();
    }

    setCursor(selectable: HTMLElement, cursor: ICursor) {
        const selectEl = window.getSelection();
        if (!selectEl) {
            return null;
        }
        const range = this.createRange(selectable, cursor);
        if (!range) {
            return;
        }

        selectEl.removeAllRanges();
        selectEl.addRange(range);
    }

    getSegmentID(node: Node): string | undefined {
        return (node!.parentElement as HTMLElement)?.dataset.segmentId;
    }

    private hasSelection(range: Range): boolean {
        if (range.startContainer !== range.endContainer) {
            return true;
        }
        return range.startOffset !== range.endOffset;
    }

    private createRange(selectable: HTMLElement, cursor: ICursor): Range | null {
        const starSegmentEl = this.selectSegment(selectable, cursor.startSegmentID);
        if (!starSegmentEl || !starSegmentEl.firstChild) {
            return null;
        }
        const endSegmentEl = this.selectSegment(selectable, cursor.endSegmentID);
        if (!endSegmentEl || !endSegmentEl.firstChild) {
            return null;
        }

        const range = document.createRange();
        range.setStart(starSegmentEl.firstChild, cursor.startOffset);
        range.setEnd(endSegmentEl.firstChild, cursor.endOffset);
        return range;
    }

    private selectSegment(el: HTMLElement, segmentID: string): HTMLElement | null {
        return el.querySelector(`[data-segment-id='${segmentID}']`);
    }
}