import React, {Component} from 'react';
import './App.scss';
import Editor from "./editor/Editor";

export default class App extends Component<any, any>{
  render() {
    return (
        <div className="App">
            <div className={'content'}>
                <Editor/>
            </div>
        </div>
    );
  }
}
