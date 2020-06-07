import {ISegment} from '../entity/segment';
import {ICursor} from '../entity/cursor';
import {IOption} from '../entity/option';

export interface IEditorState {
    options: IOption[]
    segments: ISegment[]
    cursor: ICursor
}

export function getCurrSegment(state: IEditorState): ISegment {
    return state.segments.filter(
        segment => segment.id === state.cursor.startSegmentID
    )[0];
}

export function findSegment(segmentID: string, segments: ISegment[]): ISegment {
    return segments.filter(segment => segment.id === segmentID)[0];
}