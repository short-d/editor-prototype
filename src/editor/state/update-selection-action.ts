import {Action} from './action';
import {IEditorState} from './editor.state';
import {ICursor} from '../entity/cursor';

export class UpdateSelectionAction implements Action {
    constructor(
        private startSegmentId: string,
        private startOffset: number,
        private endSegmentID: string,
        private endOffset: number
    ) {
    }

    public perform(state: IEditorState): IEditorState {
        const newCursor: ICursor = {
            startSegmentID: this.startSegmentId,
            startOffset: this.startOffset,
            endSegmentID: this.endSegmentID,
            endOffset: this.endOffset
        };
        return Object.assign({}, state, {
            cursor: newCursor
        });
    }

}