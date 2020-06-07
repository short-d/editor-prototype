import {Action} from './action';
import {getCurrSegment, IEditorState} from './editor.state';
import {ISegment} from '../entity/segment';
import {ICursor} from '../entity/cursor';

export class MoveCursorRightAction implements Action {
    public perform(state: IEditorState): IEditorState {
        const {segments, cursor} = state;
        const segment = getCurrSegment(state);
        if (this.isAtEnd(segment, segments, state.cursor)) {
            return state;
        }

        const newCursor = this.moveCursorToRight(segment, cursor, segments);
        return Object.assign({}, state, {
            cursor: newCursor
        });
    }

    private isAtEnd(currSegment: ISegment, segments: ISegment[], cursor: ICursor): boolean {
        return currSegment.idx === segments.length - 1 &&
            cursor.endOffset === currSegment.contentLength - 1;
    }

    private moveCursorToRight(segment: ISegment, cursor: ICursor, segments: ISegment[]): ICursor {
        if (this.shouldJumpRight(segment, segments, cursor)) {
            return this.jumpToRightSegment(segment, cursor, segments);
        }
        return Object.assign<any, ICursor, Partial<ICursor>>({}, cursor, {
            startOffset: cursor.startOffset + 1,
            endOffset: cursor.endOffset + 1
        });
    }

    private shouldJumpRight(segment: ISegment, segments: ISegment[], cursor: ICursor): boolean {
        return segment.idx < segments.length - 1 && cursor.endOffset === segment.contentLength - 1;
    }

    private jumpToRightSegment(segment: ISegment, cursor: ICursor, segments: ISegment[]): ICursor {
        return {
            startSegmentID: segments[segment.idx - 1].id,
            startOffset: segments[segment.idx - 1].contentLength,
            endSegmentID: segments[segment.idx - 1].id,
            endOffset: segments[segment.idx - 1].contentLength
        };
    }
}