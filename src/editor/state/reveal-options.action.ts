import {Action} from './action';
import {findSegment, IEditorState} from './editor.state';
import {IOption, OptionType} from '../entity/option';
import {ISegment, SegmentType} from '../entity/segment';
import {Style} from '../entity/style.enum';

export class RevealOptionsAction implements Action {
    public perform(state: IEditorState): IEditorState {
        const {segments, cursor} = state;
        const optionMap: Map<OptionType, IOption> = new Map<OptionType, IOption>();
        for (const optionType of this.getPossibleOptionTypes(segments)) {
            optionMap.set(optionType, {
                type: optionType,
                isApplied: false,
                isDisabled: false
            });
        }

        const startSegment = findSegment(cursor.startSegmentID, segments);
        const endSegment = findSegment(cursor.endSegmentID, segments);
        const selectedSegments = segments.slice(startSegment.idx, endSegment.idx + 1);

        const commonStyles = this.findCommonStyles(selectedSegments);
        for (let style of commonStyles) {
            const optionType = this.toOptionType(style);
            optionMap.get(optionType)!.isApplied = true;
        }

        const options: IOption[] = [];
        optionMap.forEach((option) => {
            options.push(option);
        });

        return Object.assign<any, IEditorState, Partial<IEditorState>>({}, state, {
            options: options
        });
    }

    private toOptionType(style: Style) {
        switch (style) {
            case Style.Bold:
                return OptionType.Bold;
            case Style.Italic:
                return OptionType.Italic;
            case Style.SmallFont:
                return OptionType.SmallFont;
            case Style.LargeFont:
                return OptionType.LargeFont;
            case Style.Quote:
                return OptionType.Quote;
        }
    }

    private findCommonStyles(segments: ISegment[]): Style[] {
        const stylesMap = this.countStyles(segments);
        const styles: Style[] = [];
        stylesMap.forEach((count, style) => {
            if (count === segments.length) {
                styles.push(style);
            }
        });
        return styles;
    }

    private countStyles(segments: ISegment[]) {
        const stylesMap = new Map<Style, number>();
        for (const segment of segments) {
            for (const style of segment.styles) {
                if (!stylesMap.get(style)) {
                    stylesMap.set(style, 0);
                }
                stylesMap.set(style, stylesMap.get(style)! + 1);
            }
        }
        return stylesMap;
    }

    private getPossibleOptionTypes(segments: ISegment[]): OptionType[] {
        if (this.allText(segments)) {
            return [
                OptionType.Bold,
                OptionType.Italic,
                OptionType.Link,
                OptionType.SmallFont,
                OptionType.LargeFont,
                OptionType.Quote
            ];
        }
        return [];
    }

    private allText(segments: ISegment[]): boolean {
        for (const segment of segments) {
            if (segment.type !== SegmentType.Text) {
                return false;
            }
        }
        return true;
    }
}