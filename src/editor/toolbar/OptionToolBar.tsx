import React, {Component, createRef} from 'react';

import './OptionToolBar.scss';
import {ToolBar} from './ToolBar';
import {Icon, IconType} from '../Icon';
import {IOption, OptionType} from '../entity/option';
import classNames from 'classnames';

interface IProps {
    options: IOption[]
    onOptionSelected?: (optionIdx: number) => void
}

interface IState {
    isShown: boolean
    left: number
    top: number
}

export class OptionToolBar extends Component<IProps, IState> {
    private toolbarRef = createRef<ToolBar>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            isShown: false,
            left: 0,
            top: 0
        };
    }

    render() {
        return (
            <ToolBar ref={this.toolbarRef}>
                <div className={'icon-buttons'}>
                    {this.props.options.map(this.renderButton)}
                </div>
            </ToolBar>
        );
    }

    renderButton = (option: IOption, optionIdx: number) => {
        return (
            <div
                key={optionIdx}
                className={classNames(
                    {
                        'icon-button': true,
                        'applied': option.isApplied,
                        'disabled': option.isDisabled
                    }
                )}
                onClick={this.handleButtonClick(option, optionIdx)}>
                <Icon iconType={this.toIconType(option.type)}/>
            </div>);
    };

    toIconType(optionType: OptionType): IconType {
        switch (optionType) {
            case OptionType.Bold:
                return IconType.Bold;
            case OptionType.Italic:
                return IconType.Italic;
            case OptionType.Link:
                return IconType.Link;
            case OptionType.LargeFont:
                return IconType.LargeText;
            case OptionType.SmallFont:
                return IconType.SmallText;
            case OptionType.Quote:
                return IconType.Quote;
        }
    }

    show = (left: number, top: number) => {
        this.toolbarRef.current?.show(left, top);
    };

    hide = () => {
        this.toolbarRef.current?.hide();
    };

    private handleButtonClick(option: IOption, optionIdx: number) {
        return () => {
            if (!this.props.onOptionSelected) {
                return;
            }
            if (option.isDisabled) {
                return;
            }
            this.props.onOptionSelected(optionIdx);
        };
    }
}