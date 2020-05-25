import React, {Component, createRef} from 'react';

import './TextToolBar.scss';
import {ToolBar} from './ToolBar';
import {Icon, IconType} from '../Icon';
import classNames from 'classnames';

interface IProps {
    onBoldClick?: () => void
    onItalicClick?: () => void
    onLinkClick?: () => void
    onLargeTextClick?: () => void
    onSmallTextClick?: () => void
    onQuoteClick?: () => void
}

enum ButtonState {
    Disabled,
    Enabled,
    Unavailable
}

interface IState {
    isShown: boolean
    left: number
    top: number
    boldButton: ButtonState
    italicButton: ButtonState
    linkButton: ButtonState
    largeTextButton: ButtonState
    smallTextButton: ButtonState
    quoteButton: ButtonState
}

export class TextToolbar extends Component<IProps, IState> {
    private toolbarRef = createRef<ToolBar>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            isShown: false,
            left: 0,
            top: 0,
            boldButton: ButtonState.Disabled,
            italicButton: ButtonState.Disabled,
            linkButton: ButtonState.Disabled,
            largeTextButton: ButtonState.Disabled,
            smallTextButton: ButtonState.Disabled,
            quoteButton: ButtonState.Disabled
        };
    }

    render() {
        return (
            <ToolBar ref={this.toolbarRef}>
                <div className={'icon-buttons'}>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.boldButton === ButtonState.Enabled,
                            'unavailable': this.state.boldButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleBoldClick}
                    >
                        <Icon iconType={IconType.Bold}/>
                    </div>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.italicButton === ButtonState.Enabled,
                            'unavailable': this.state.italicButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleItalicClick}
                    >
                        <Icon iconType={IconType.Italic}/>
                    </div>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.linkButton === ButtonState.Enabled,
                            'unavailable': this.state.linkButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleLinkClick}
                    >
                        <Icon iconType={IconType.Link}/>
                    </div>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.largeTextButton === ButtonState.Enabled,
                            'unavailable': this.state.largeTextButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleLargeTextClick}>
                        <Icon iconType={IconType.LargeText}/>
                    </div>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.smallTextButton === ButtonState.Enabled,
                            'unavailable': this.state.smallTextButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleSmallTextClick}
                    >
                        <Icon iconType={IconType.SmallText}/>
                    </div>
                    <div className={classNames(
                        {
                            'icon-button': true,
                            'enabled': this.state.quoteButton === ButtonState.Enabled,
                            'unavailable': this.state.quoteButton === ButtonState.Unavailable
                        }
                    )}
                         onClick={this.handleQuoteClick}>
                        <Icon iconType={IconType.Quote}/>
                    </div>
                </div>
            </ToolBar>
        );
    }

    show = (left: number, top: number) => {
        this.toolbarRef.current?.show(left, top);
    };

    hide = () => {
        this.toolbarRef.current?.hide();
    };

    private handleBoldClick = () => {
        this.handleButtonClick(
            this.state.boldButton,
            (buttonState) => {
                this.setState({
                    boldButton: buttonState
                });
            },
            this.props.onBoldClick
        );
    };

    private handleItalicClick = () => {
        this.handleButtonClick(
            this.state.italicButton,
            (buttonState) => {
                this.setState({
                    italicButton: buttonState
                });
            },
            this.props.onItalicClick
        );
    };

    private handleLinkClick = () => {
        this.handleButtonClick(
            this.state.linkButton,
            (buttonState) => {
                this.setState({
                    linkButton: buttonState
                });
            },
            this.props.onLinkClick
        );
    };

    private handleLargeTextClick = () => {
        this.handleButtonClick(
            this.state.largeTextButton,
            (buttonState) => {
                this.setState({
                    largeTextButton: buttonState
                });
            },
            this.props.onLargeTextClick
        );
    };

    private handleSmallTextClick = () => {
        this.handleButtonClick(
            this.state.smallTextButton,
            (buttonState) => {
                this.setState({
                    smallTextButton: buttonState
                });
            },
            this.props.onSmallTextClick
        );
    };

    private handleQuoteClick = () => {
        this.handleButtonClick(
            this.state.quoteButton,
            (buttonState) => {
                this.setState({
                    quoteButton: buttonState
                });
            },
            this.props.onQuoteClick
        );
    };

    private handleButtonClick(
        buttonState: ButtonState,
        setButtonState: (buttonState: ButtonState) => void,
        onClick?: () => void
    ) {
        if (buttonState === ButtonState.Unavailable) {
            return;
        }
        if (!onClick) {
            return;
        }
        onClick();
        if (buttonState === ButtonState.Enabled) {
            setButtonState(ButtonState.Disabled);
            return;
        }
        setButtonState(ButtonState.Enabled);
    }
}