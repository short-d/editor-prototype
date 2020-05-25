import React, {ClipboardEvent, Component, createRef, KeyboardEvent, MouseEvent} from 'react';

import './Editor.scss';
import {ARROW_LEFT, ARROW_RIGHT, BACKSPACE, META} from './key';
import {TextToolbar} from './toolbar/TextToolBar';

enum SegmentType {
    Text
}

enum Style {
    Bold,
    Italic,
    LargeFont,
    SmallFont
}

interface Segment {
    idx: number
    id: string
    type: SegmentType
    styles: Style[]
    content: any
    contentLength: number
}

interface Cursor {
    startSegmentID: string
    startOffset: number
    endSegmentID: string
    endOffset: number
}

interface State {
    segments: Segment[]
    cursor: Cursor
}

export default class Editor extends Component<any, State> {
    private editableRegion = createRef<HTMLDivElement>();
    private textToolbarRef = createRef<TextToolbar>();

    private isHoldingMetaKey = false;

    constructor(props: any) {
        super(props);
        this.state = {
            segments: [
                {
                    idx: 0,
                    id: '1',
                    type: SegmentType.Text,
                    styles: [],
                    content: 'abcedfg'.split(''),
                    contentLength: 7
                },
                {
                    idx: 1,
                    id: '2',
                    type: SegmentType.Text,
                    styles: [
                        Style.Italic
                    ],
                    content: 'hijklm'.split(''),
                    contentLength: 6
                }
            ],
            cursor: {
                startSegmentID: '1',
                startOffset: 0,
                endSegmentID: '1',
                endOffset: 0
            }
        };
    }

    render() {
        return (
            <div className={'Editor'}>
                <div ref={this.editableRegion}
                     className={'editable-region'}
                     contentEditable
                     suppressContentEditableWarning={true}
                     onKeyDown={this.handleOnKeyDown}
                     onKeyUp={this.handleOnKeyUp}
                     onClick={this.handleOnClick}
                     onMouseUp={this.handleOnMouseUp}
                     onPaste={this.handleOnPaste}
                     onBlur={this.handleOnBlur}
                >
                    {this.renderSegments()}
                </div>
                <TextToolbar
                    ref={this.textToolbarRef}
                    onBoldClick={this.handleBoldClick}
                    onItalicClick={this.handleItalicClick}
                    onLinkClick={this.handleLinkClick}
                    onLargeTextClick={this.handleLargeTextClick}
                    onSmallTextClick={this.handleSmallTextClick}
                    onQuoteClick={this.handleQuoteClick}
                />
            </div>
        );
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any) {
        if (!this.editableRegion || !this.editableRegion.current) {
            return;
        }
        const el = this.editableRegion.current;
        if (!el) {
            return;
        }

        const selectEl = window.getSelection();
        if (!selectEl) {
            return;
        }

        const range = document.createRange();

        const starSegmentEl = this.selectSegment(el, this.state.cursor.startSegmentID);
        if (!starSegmentEl || !starSegmentEl.firstChild) {
            return;
        }
        const endSegmentEl = this.selectSegment(el, this.state.cursor.endSegmentID);
        if (!endSegmentEl || !endSegmentEl.firstChild) {
            return;
        }

        range.setStart(starSegmentEl.firstChild, this.state.cursor.startOffset);
        range.setEnd(endSegmentEl.firstChild, this.state.cursor.endOffset);
        selectEl.removeAllRanges();
        selectEl.addRange(range);
    }

    private renderSegments() {
        return this.state.segments.map(this.renderSegment);
    }

    private renderSegment = (segment: Segment) => {
        switch (segment.type) {
            case SegmentType.Text:
                return (
                    <span data-segment-id={segment.id}
                          key={segment.id}
                          className={this.getTextStyleClassName(segment.styles)}
                    >
                        {segment.content.join('')}
                    </span>
                );
        }
    };

    private getTextStyleClassName(styles: Style[]): string {
        const textStyles = [Style.Bold, Style.Italic, Style.LargeFont, Style.SmallFont];
        return styles
            .filter(style => textStyles.indexOf(style) >= -1)
            .map(style => {
                switch (style) {
                    case Style.Bold:
                        return 'bold';
                    case Style.Italic:
                        return 'italic';
                    case Style.LargeFont:
                        return 'large-font';
                    case Style.SmallFont:
                        return 'small-font';
                    default:
                        return '';
                }
            })
            .join(' ');
    }

    private selectSegment(el: HTMLElement, segmentID: string): HTMLElement | null {
        return el.querySelector(`[data-segment-id='${segmentID}']`);
    }

    private handleOnKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case BACKSPACE:
                event.preventDefault();
                this.deleteChar();
                return;
            case ARROW_LEFT:
                event.preventDefault();
                this.moveCursorLeft();
                return;
            case ARROW_RIGHT:
                event.preventDefault();
                this.moveCursorRight();
                return;
            case META:
                event.preventDefault();
                this.isHoldingMetaKey = true;
                return;
            default:
                if (this.isHoldingMetaKey) {
                    return;
                }
                event.preventDefault();
                if (event.key.length > 1) {
                    return;
                }
                this.insertText(event.key);
        }
    };

    private handleOnPaste = (event: ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('Text');
        if (text.length < 1) {
            return;
        }
        this.insertText(text);
    };

    private insertText(text: string) {
        const {cursor, segments} = this.state;

        const segment = this.getCurrSegment();
        segment.content.splice(cursor.startOffset, 0, ...text.split(''));
        segment.contentLength += text.length;
        cursor.startOffset += text.length;
        cursor.endOffset += text.length;

        this.setState({
            segments: segments,
            cursor: cursor
        });
    }

    private deleteChar() {
        const {cursor, segments} = this.state;

        const segment = this.getCurrSegment();
        if (this.isAtLeftMost(segment, cursor)) {
            return;
        }

        segment.content.splice(cursor.startOffset - 1, 1);
        segment.contentLength--;
        if (segment.idx > 0 && segment.contentLength === 0) {
            segments.splice(segment.idx, 1);
        }
        if (this.jumpToLeftSegment(segment, cursor, segments)) {
            return;
        }
        cursor.startOffset--;
        cursor.endOffset--;

        this.setState({
            segments: segments,
            cursor: cursor
        });
    }

    private isAtLeftMost(segment: Segment, cursor: Cursor) {
        return segment.idx === 0 && cursor.endOffset === 0;
    }

    private jumpToLeftSegment(segment: Segment, cursor: Cursor, segments: Segment[]): boolean {
        if (segment.idx > 0 && cursor.endOffset === 1) {
            cursor.startSegmentID = segments[segment.idx - 1].id;
            cursor.startOffset = segments[segment.idx - 1].contentLength;
            cursor.endSegmentID = segments[segment.idx - 1].id;
            cursor.endOffset = segments[segment.idx - 1].contentLength;
            this.setState({cursor: cursor});
            return true;
        }
        return false;
    }

    private moveCursorLeft() {
        const {cursor, segments} = this.state;

        const segment = this.getCurrSegment();
        if (this.isAtLeftMost(segment, cursor)) {
            return;
        }

        if (this.jumpToLeftSegment(segment, cursor, segments)) {
            return;
        }

        cursor.startOffset--;
        cursor.endOffset--;
        this.setState({cursor: cursor});
    }

    private jumpToRightSegment(segment: Segment, cursor: Cursor, segments: Segment[]): boolean {
        const end = segments.length - 1;
        if (segment.idx < end && cursor.endOffset === segments[segment.idx].contentLength - 1) {
            cursor.startSegmentID = segments[segment.idx + 1].id;
            cursor.startOffset = 0;
            cursor.endSegmentID = segments[segment.idx + 1].id;
            cursor.endOffset = 0;
            this.setState({cursor: cursor});
            return true;
        }
        return false;
    }

    private moveCursorRight() {
        const {cursor, segments} = this.state;
        const segment = this.getCurrSegment();

        const end = segments.length - 1;
        if (segment.idx === end && cursor.endOffset === segments[end].contentLength) {
            return;
        }

        if (this.jumpToRightSegment(segment, cursor, segments)) {
            return;
        }

        cursor.startOffset++;
        cursor.endOffset++;
        this.setState({cursor: cursor});
    }

    private findSegment(id: string) {
        return this.state.segments.filter(
            segment => segment.id === id
        )[0];
    }

    private getCurrSegment(): Segment {
        return this.findSegment(this.state.cursor.startSegmentID);
    }


    private handleOnKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === META) {
            this.isHoldingMetaKey = false;
        }
    };

    private saveCursor = () => {
        const {cursor} = this.state;

        const selection = document.getSelection();
        if (!selection) {
            return 0;
        }
        const range = selection.getRangeAt(0);
        cursor.startSegmentID = (selection.anchorNode!.parentElement as HTMLElement)?.dataset.segmentId!;
        cursor.startOffset = range.startOffset;
        cursor.endSegmentID = (selection.focusNode!.parentElement as HTMLElement)?.dataset.segmentId!;
        cursor.endOffset = range.endOffset;
        this.setState({
            cursor: cursor
        });
    };

    private handleOnClick = (event: MouseEvent) => {
        this.saveCursor();
    };

    private handleOnMouseUp = () => {
        const selection = document.getSelection();
        if (!selection) {
            return;
        }

        const range = selection.getRangeAt(0);
        if (!this.hasSelection(range)) {
            this.textToolbarRef.current?.hide();
            return;
        }
        const rect = range.getBoundingClientRect();
        const horizontalCenter = rect.x + rect.width / 2;
        this.textToolbarRef.current?.show(horizontalCenter, rect.y);
    };

    private hasSelection(range: Range): boolean {
        if (range.startContainer !== range.endContainer) {
            return true;
        }
        return range.startOffset !== range.endOffset;
    }

    private handleBoldClick = () => {
        const {cursor, segments} = this.state;
        const startSegment = this.findSegment(cursor.startSegmentID);
        const endSegment = this.findSegment(cursor.endSegmentID);

        if (cursor.startSegmentID === cursor.endSegmentID) {
            if (cursor.startOffset === cursor.endOffset) {
                return;
            }
            const newSegment = this.styleInsideSegment(startSegment, cursor.startOffset, cursor.endOffset, segments);
            if (!newSegment) {
                return;
            }
            cursor.startSegmentID = newSegment.id;
            cursor.startOffset = 0;
            cursor.endSegmentID = newSegment.id;
            cursor.endOffset = newSegment.contentLength;
            return;
        }
        const leftNewSegment = this.styleInsideSegment(startSegment, cursor.startOffset, startSegment.contentLength, segments);
        if (!leftNewSegment) {
            return;
        }
        const rightNewSegment = this.styleInsideSegment(endSegment, 0, cursor.endOffset, segments);
        if (!rightNewSegment) {
            return;
        }
        cursor.startSegmentID = leftNewSegment.id;
        cursor.startOffset = 0;
        cursor.endSegmentID = rightNewSegment.id;
        cursor.endOffset = rightNewSegment.contentLength;
    };

    private styleInsideSegment(startSegment: Segment, startOffset: number, endOffset: number, segments: Segment[]): Segment | null {
        if (startSegment.styles.indexOf(Style.Bold) > -1) {
            return null;
        }

        const newSegments: Segment[] = [];
        if (startOffset > 0) {
            const content = startSegment.content.slice(0, startOffset);
            newSegments.push({
                idx: -1,
                id: '',
                type: startSegment.type,
                styles: startSegment.styles,
                content: content,
                contentLength: content.length
            });
        }

        const content = startSegment.content.slice(startOffset, endOffset);
        const newSegment = {
            idx: -1,
            id: '',
            type: startSegment.type,
            styles: startSegment.styles.concat(Style.Bold),
            content: content,
            contentLength: content.length
        };
        newSegments.push(newSegment);

        if (endOffset < startSegment.contentLength - 1) {
            const content = startSegment.content.slice(endOffset, startSegment.contentLength);
            newSegments.push({
                idx: -1,
                id: '',
                type: startSegment.type,
                styles: startSegment.styles,
                content: content,
                contentLength: content.length
            });
        }

        segments.splice(startSegment.idx, 1, ...newSegments);
        this.updateIndices();
        return newSegment;
    }

    private updateIndices() {
        const {segments} = this.state;
        this.setState({
            segments: segments.map((segment, idx) => {
                segment.idx = idx;
                segment.id = `${idx}`;
                return segment;
            })
        });
    }

    private handleItalicClick = () => {

    };

    private handleLinkClick = () => {

    };

    private handleLargeTextClick = () => {

    };

    private handleSmallTextClick = () => {

    };

    private handleQuoteClick = () => {

    };

    private handleOnBlur = () => {
        this.saveCursor();
    };
}