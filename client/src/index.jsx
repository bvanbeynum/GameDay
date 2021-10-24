import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./media/favicon.ico"

class App extends Component {
	constructor(props) {
		super(props);

	}
	
	render() {
		return (
			<div className="appContainer">
				<h1>Hello Wold</h1>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
