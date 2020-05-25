import React, {Component} from 'react';

import './ToolBar.scss';
import classNames from 'classnames';

interface IState {
    isShown: boolean
    left: number
    top: number
}

export class ToolBar extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isShown: false,
            left: 200,
            top: 50
        };
    }

    render() {
        return (
            <div className={classNames({
                'Toolbar': true,
                'shown': this.state.isShown
            })}
                 style={{
                     left: this.state.left,
                     top: this.state.top
                 }}>
                {this.props.children}
                <div className={'triangle'}/>
            </div>
        );
    }

    show(left: number, top: number) {
        this.setState({
            top: top,
            left: left,
            isShown: true
        });
    }

    hide() {
        this.setState({
            isShown: false
        });
    }
}