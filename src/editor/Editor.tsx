import React, {ClipboardEvent, Component, createRef, DragEvent, FocusEvent, KeyboardEvent, MouseEvent} from 'react';

import './Editor.scss';
import {ARROW_LEFT, ARROW_RIGHT, BACKSPACE, META} from './key';
import {OptionToolBar} from './toolbar/OptionToolBar';
import {StyleService} from './service/style.service';
import {ISegment, SegmentType} from './entity/segment';
import {IEditorStateService, Subscriber} from './state/editor-state.service';
import {InsertTextAction} from './state/insert-text.action';
import {DeleteTextAction} from './state/delete-text.action';
import {IEditorState} from './state/editor.state';
import {MoveCursorLeftAction} from './state/move-cursor-left.action';
import {MoveCursorRightAction} from './state/move-cursor-right.action';
import {SelectionService} from './service/selection.service';
import {UpdateSelectionAction} from './state/update-selection-action';
import {ToggleOptionAction} from './state/toggle-option.action';
import {RevealOptionsAction} from './state/reveal-options.action';

export default class Editor extends Component<any, IEditorState> {
    private selectionService = new SelectionService();
    private styleService = new StyleService();
    private editorStateService = new IEditorStateService();

    private readonly stateChangeSubscriber: Subscriber;

    private editableRegion = createRef<HTMLDivElement>();
    private optionToolbarRef = createRef<OptionToolBar>();

    private isHoldingMetaKey = false;

    constructor(props: any) {
        super(props);
        this.state = this.editorStateService.getState();

        this.stateChangeSubscriber = () => this.setState(this.editorStateService.getState());
        this.editorStateService.onStateChange(this.stateChangeSubscriber);
    }

    public componentWillUnmount() {
        this.editorStateService.unSubscribe(this.stateChangeSubscriber);
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
                     onMouseUp={this.handleOnMouseUp}
                     onPaste={this.handleOnPaste}
                     onDrag={this.handleOnDrag}
                     onBlur={this.handleOnBlur}
                >
                    {this.renderSegments()}
                </div>
                <OptionToolBar
                    ref={this.optionToolbarRef}
                    options={this.state.options}
                    onOptionSelected={this.onOptionSelected}
                />
            </div>
        );
    }

   private showCursor() {
        if (!this.editableRegion || !this.editableRegion.current) {
            return;
        }
        const el = this.editableRegion.current;
        if (!el) {
            return;
        }

        this.selectionService.setCursor(el, this.state.cursor);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<IEditorState>, snapshot?: any) {
        this.showCursor();
    }

    private renderSegments() {
        return this.state.segments.map(this.renderSegment);
    }

    private renderSegment = (segment: ISegment) => {
        switch (segment.type) {
            case SegmentType.Text:
                return (
                    <span data-segment-id={segment.id}
                          key={segment.id}
                          className={this.styleService.getTextStyleClassName(segment.styles)}
                    >
                        {segment.content.join('')}
                    </span>
                );
        }
    };

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
        const action = new InsertTextAction(text);
        this.editorStateService.performAction(action);
    }

    private deleteChar() {
        const action = new DeleteTextAction();
        this.editorStateService.performAction(action);
    }

    private moveCursorLeft() {
        const action = new MoveCursorLeftAction();
        this.editorStateService.performAction(action);
    }

    private moveCursorRight() {
        const action = new MoveCursorRightAction();
        this.editorStateService.performAction(action);
    }

    private handleOnKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === META) {
            this.isHoldingMetaKey = false;
        }
    };

    private handleOnMouseUp = (event: MouseEvent) => {
        event.preventDefault();
        const range = this.selectionService.getSelection();
        if (!range) {
            return;
        }
        const startSegmentID = this.selectionService.getSegmentID(range.startContainer);
        if (!startSegmentID) {
            return;
        }

        const endSegmentID = this.selectionService.getSegmentID(range.endContainer);
        if (!endSegmentID) {
            return;
        }

        const action = new UpdateSelectionAction(startSegmentID, range.startOffset, endSegmentID, range.endOffset);
        this.editorStateService.performAction(action);

        const box = this.selectionService.getSelectionBoundingBox();
        if (!box) {
            this.optionToolbarRef.current?.hide();
            return;
        }
        const revealOptionsAction = new RevealOptionsAction();
        this.editorStateService.performAction(revealOptionsAction);

        const xCenter = box.x + box.width / 2;
        this.optionToolbarRef.current?.show(xCenter, box.y);
    };

    private onOptionSelected = (optionIdx: number) => {
        const action = new ToggleOptionAction(optionIdx);
        this.editorStateService.performAction(action);
    };

    private handleOnDrag(event: DragEvent) {
        event.preventDefault();
    };

    private handleOnBlur = (event: FocusEvent<HTMLDivElement>) => {
        event.preventDefault();
        this.showCursor();
    };
}