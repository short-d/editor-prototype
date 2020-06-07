import React, {Component} from 'react';
import './App.scss';
import Editor from './editor/Editor';

export default class App extends Component<any, any> {
    render() {
        return (
            <div className="App">
                <header>
                    <div className={'center'}>
                        <span className={'logo'}>Short</span>
                        Editor
                    </div>
                </header>
                <div className={'center content'}>
                    <Editor/>
                </div>
                <footer className={'center'}>
                    Made with
                    <i className="heart">
                    </i>
                    by <a href="https://github.com/byliuyang">Harry</a>
                </footer>
            </div>
        );
    }
}
