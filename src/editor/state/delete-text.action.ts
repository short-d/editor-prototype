import {Action} from './action';
import {getCurrSegment, IEditorState} from './editor.state';
import {remove} from '../array';
import {ISegment} from '../entity/segment';
import {MoveCursorLeftAction} from './move-cursor-left.action';

export class DeleteTextAction implements Action {
    public perform(state: IEditorState): IEditorState {
        const {cursor, segments} = state;
        const segment = getCurrSegment(state);

        const newSegment = Object.assign<any, ISegment, Partial<ISegment>>(
            {},
            segment,
            {
                content: remove<string[]>(segment.content, cursor.startOffset - 1),
                contentLength: segment.contentLength - 1
            });

        let newSegments = segments.map(segment => {
            if (segment.id !== newSegment.id) {
                return segment;
            }
            return newSegment;
        });
        if (segment.idx > 0 && newSegment.contentLength === 0) {
            newSegments = remove<ISegment>(segments, segment.idx);
        }

        const newState: IEditorState = Object.assign({}, state, {
            segments: newSegments,
            cursor: cursor
        });

        const action = new MoveCursorLeftAction();
        return action.perform(newState);
    }
}