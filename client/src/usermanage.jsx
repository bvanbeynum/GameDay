import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/usermanage.css";

class UserManage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			toast: { message: "", type: "info" }
		}
	}

	componentDidMount() {
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
			return;
		}

		fetch(`/api/usermanageload`)
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(data => {
				this.setState({
					isLoading: false,
					user: data.user,
					users: data.users,
					requests: data.requests
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	};

	navBack = () => {
		window.location = "/schedule.html";
	};

	render() { return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } teamName={ this.state.user.team.name } adminMenu={ this.state.user.modules } />

			{
			this.state.isLoading ?
			<div className="loading">
				<img alt="Loading" src="/media/images/loading.gif" />
			</div>
			:
			<div className="userPage">

			{ this.state.requests.map(request => (
				<div key={ request.id } className="requestContainer">
					<div>{ request.requestDate }</div>
				</div>
			)) }

			</div>
			}

			<Toast message={ this.state.toast } />
		</div>
	)};

};

ReactDOM.render(<UserManage />, document.getElementById("root"));
