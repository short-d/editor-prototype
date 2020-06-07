import {Action} from './action';
import {findSegment, IEditorState} from './editor.state';
import {ISegment, SegmentType} from '../entity/segment';
import {IOption, OptionType} from '../entity/option';
import {ICursor} from '../entity/cursor';
import {Style} from '../entity/style.enum';
import {insert, remove} from '../array';

export class ToggleOptionAction implements Action {
    constructor(private optionIdx: number) {
    }

    public perform(state: IEditorState): IEditorState {
        const {options, segments, cursor} = state;
        const option = options[this.optionIdx];

        let newSegments: ISegment[];
        let newOption: IOption;
        if (option.isApplied) {
            newSegments = this.undoOption(option, segments, cursor);
            newOption = Object.assign<any, IOption, Partial<IOption>>({}, option, {isApplied: false});
        } else {
            newSegments = this.applyOption(option, segments, cursor);
            newOption = Object.assign<any, IOption, Partial<IOption>>({}, option, {isApplied: true});
        }
        const newOptions = options.map((opt: IOption, idx: number) => {
            if (idx === this.optionIdx) {
                return newOption;
            }
            return opt;
        });
        return Object.assign<any, IEditorState, Partial<IEditorState>>({}, state, {
            options: newOptions,
            segments: newSegments,
            // TODO
            cursor: {
                startSegmentID: '0',
                startOffset: 0,
                endSegmentID: '0',
                endOffset: 0
            }
        });
    }

    private applyOption(option: IOption, segments: ISegment[], cursor: ICursor): ISegment[] {
        if (cursor.startSegmentID === cursor.endSegmentID) {
            return this.applyToSingleSegment(option, cursor, segments);
        }
        return this.applyToMultipleSegments(option, cursor, segments);
    }

    private applyToSingleSegment(option: IOption, cursor: ICursor, segments: ISegment[]): ISegment[] {
        const segment = findSegment(cursor.startSegmentID, segments);
        const slices: ISegment[] = [];

        if (cursor.startOffset > 0) {
            this.addStartSegment(segment, cursor, slices);
        }

        this.addStyledSegment(option, segment, cursor, slices);

        if (cursor.endOffset < segment.contentLength - 1) {
            this.addEndSegment(segment, cursor, slices);
        }
        let newSegments = remove<ISegment>(segments, segment.idx);
        newSegments = insert<ISegment>(newSegments, segment.idx, slices);
        // TODO: adjust cursor
        return this.updateIdxAndID(newSegments);
    }

    private applyToMultipleSegments(option: IOption, cursor: ICursor, segments: ISegment[]): ISegment[] {
        const startSegment = findSegment(cursor.startSegmentID, segments);
        const endSegment = findSegment(cursor.endSegmentID, segments);
        const slices: ISegment[] = [];

        const newStyle = this.getStyle(option.type);
        if (!newStyle) {
            return segments;
        }

        this.addSlicedStartSegments(option, newStyle, startSegment, cursor, slices);

        for (let idx = startSegment.idx + 1; idx < endSegment.idx; idx++) {
            const currSegment = segments[idx];
            const newSegment = Object.assign<any, ISegment, Partial<ISegment>>({}, currSegment, {
                styles: this.concatUniqueStyle(currSegment.styles, newStyle)
            });
            slices.push(newSegment);
        }

        // TODO: style override bug

        this.addSlicedEndSegments(option, newStyle, endSegment, cursor, slices);
        let newSegments = remove<ISegment>(segments, startSegment.idx);
        newSegments = remove<ISegment>(newSegments, endSegment.idx - 1);
        newSegments = insert<ISegment>(newSegments, startSegment.idx, slices);
        // TODO: adjust cursor
        return this.updateIdxAndID(newSegments);
    }

    private updateIdxAndID(segments: ISegment[]): ISegment[] {
        return segments.map(
            (segment, idx) => Object.assign<any, ISegment, Partial<ISegment>>({}, segment, {
                idx: idx,
                id: `${idx}`
            })
        );
    }

    private addSlicedStartSegments(option: IOption, newStyle: Style, startSegment: ISegment, cursor: ICursor, slices: ISegment[]) {
        if (cursor.startOffset > 0 && cursor.startOffset < startSegment.contentLength - 1) {
            this.addStartSegment(startSegment, cursor, slices);
        }

        const firstEndContent = startSegment.content.slice(cursor.startOffset);
        const newStyles = this.concatUniqueStyle(startSegment.styles, newStyle);
        const firstEndSegment: ISegment = {
            idx: -1,
            id: '-1',
            type: this.getSegmentType(option.type),
            styles: newStyles,
            content: firstEndContent,
            contentLength: firstEndContent.length
        };
        slices.push(firstEndSegment);
    }

    private addSlicedEndSegments(option: IOption, newStyle: Style, endSegment: ISegment, cursor: ICursor, slices: ISegment[]) {
        const lastStartContent = endSegment.content.slice(0, cursor.endOffset);
        const newStyles = this.concatUniqueStyle(endSegment.styles, newStyle);
        const lastStartSegment: ISegment = {
            idx: -1,
            id: '-1',
            type: this.getSegmentType(option.type),
            styles: newStyles,
            content: lastStartContent,
            contentLength: lastStartContent.length
        };
        slices.push(lastStartSegment);

        if (cursor.endOffset > 0 && cursor.endOffset < endSegment.contentLength - 1) {
            this.addEndSegment(endSegment, cursor, slices);
        }

    }

    private concatUniqueStyle(styles: Style[], newStyle: Style) {
        if (styles.indexOf(newStyle) < 0) {
            return styles.concat(newStyle);
        }
        return styles;
    }

    private addStartSegment(segment: ISegment, cursor: ICursor, slices: ISegment[]) {
        const startContent = segment.content.slice(0, cursor.startOffset);
        slices.push({
            idx: -1,
            id: '-1',
            type: segment.type,
            styles: segment.styles,
            content: startContent,
            contentLength: startContent.length
        });
    }

    private addStyledSegment(option: IOption, segment: ISegment, cursor: ICursor, slices: ISegment[]) {
        let newStyles = segment.styles.map(style => style);
        const style = this.getStyle(option.type);
        if (style !== null) {
            newStyles.push(style);
        }

        const styledContent = segment.content.slice(cursor.startOffset, cursor.endOffset);
        slices.push({
            idx: -1,
            id: '-1',
            type: this.getSegmentType(option.type),
            styles: newStyles,
            content: styledContent,
            contentLength: styledContent.length
        });
    }

    private addEndSegment(segment: ISegment, cursor: ICursor, slices: ISegment[]) {
        const endContent = segment.content.slice(cursor.endOffset);
        slices.push({
            idx: -1,
            id: '-1',
            type: segment.type,
            styles: segment.styles,
            content: endContent,
            contentLength: endContent.length
        });
    }

    private getSegmentType(optionType: OptionType): SegmentType {
        return SegmentType.Text;
    }

    private getStyle(optionType: OptionType): Style | null {
        switch (optionType) {
            case OptionType.Bold:
                return Style.Bold;
            case OptionType.Italic:
                return Style.Italic;
            case OptionType.Link:
                return null;
            case OptionType.SmallFont:
                return Style.SmallFont;
            case OptionType.LargeFont:
                return Style.LargeFont;
            case OptionType.Quote:
                return Style.Quote;
        }
    }

    private undoOption(option: IOption, segments: ISegment[], cursor: ICursor): ISegment[] {
        // TODO
        return segments;
    }
}