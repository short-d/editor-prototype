import {Action} from './action';
import {getCurrSegment, IEditorState} from './editor.state';
import {ISegment} from '../entity/segment';
import {ICursor} from '../entity/cursor';

export class MoveCursorLeftAction implements Action {
    public perform(state: IEditorState): IEditorState {
        const {segments, cursor} = state;
        const segment = getCurrSegment(state);
        if (this.isAtStart(segment, state.cursor)) {
            return state;
        }

        const newCursor = this.moveCursorToLeft(segment, cursor, segments);
        return Object.assign({}, state, {
            cursor: newCursor
        });
    }

    private isAtStart(currSegment: ISegment, cursor: ICursor): boolean {
        return currSegment.idx === 0 && cursor.startOffset === 0;
    }

    private moveCursorToLeft(segment: ISegment, cursor: ICursor, segments: ISegment[]): ICursor {
        if (this.shouldJumpLeft(segment, cursor)) {
            return this.jumpToLeftSegment(segment, segments);
        }
        return Object.assign<any, ICursor, Partial<ICursor>>({}, cursor, {
            startOffset: cursor.startOffset - 1,
            endOffset: cursor.endOffset - 1
        });
    }

    private shouldJumpLeft(segment: ISegment, cursor: ICursor): boolean {
        return segment.idx > 0 && cursor.startOffset === 1;
    }

    private jumpToLeftSegment(segment: ISegment, segments: ISegment[]): ICursor {
        return {
            startSegmentID: segments[segment.idx - 1].id,
            startOffset: segments[segment.idx - 1].contentLength,
            endSegmentID: segments[segment.idx - 1].id,
            endOffset: segments[segment.idx - 1].contentLength
        };
    }
}