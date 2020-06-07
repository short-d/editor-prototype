import {Action} from './action';
import {ISegment} from '../entity/segment';
import {ICursor} from '../entity/cursor';
import {getCurrSegment, IEditorState} from './editor.state';
import {insert} from '../array';

export class InsertTextAction implements Action {
    private readonly chars: string[];

    constructor(private text: string) {
        this.chars = text.split('');
    }

    public perform(state: IEditorState): IEditorState {
        const {cursor, segments} = state;
        const segment = getCurrSegment(state);
        if (!segment) {
            return state;
        }

        const newSegment: ISegment = Object.assign({}, segment, {
            content: insert<string>(segment.content, cursor.startOffset, this.chars),
            contentLength: segment.contentLength + this.chars.length
        });
        const newCursor: ICursor = Object.assign({}, cursor, {
            startOffset: cursor.startOffset + this.chars.length,
            endOffset: cursor.startOffset + this.chars.length
        });
        const newSegments = segments.map(currSegment => {
            if (currSegment.idx === segment.idx) {
                return newSegment;
            }
            return currSegment;
        });
        return Object.assign({}, state, {
            segments: newSegments,
            cursor: newCursor
        });
    }
}