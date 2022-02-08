import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import RequestEditPopup from "./components/requestedit";
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
					users: data.users
						.filter(user => user.firstName)
						.map(user => ({
							...user,
							lastAccessed: user.devices && user.devices.some(device => device.lastAccess) ? 
								user.devices.reduce((lastAccess, device) => new Date(device.lastAccess) > lastAccess ? new Date(device.lastAccess) : lastAccess, new Date(1900,0,1)) 
								: null,
							devices: user.devices ? user.devices.map(device => ({ ...device, lastAccess: new Date(device.lastAccess) })) : null
						})),
					requests: data.requests.map(userRequest => ({
						...userRequest,
						device: {
							...userRequest.device,
							lastAccess: new Date(userRequest.device.lastAccess)
						}
					}))
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

				<h2>Active Requests</h2>

				{ this.state.requests
					.sort((requestA, requestB) => requestB.device.lastAccess - requestA.device.lastAccess)
					.map(userRequest => (
				<div key={ userRequest.id } className="itemContainer" onClick={ () => { this.setState({ selectedRequest: userRequest }) }}>
					<div className="row">
						<div className="item">{ userRequest.device.domain }</div>
						<div className="item">{ `${ userRequest.device.lastAccess.toLocaleDateString() } ${ userRequest.device.lastAccess.toLocaleTimeString() }` }</div>
					</div>

					<div className="row">
						<div className="item">{ userRequest.name }</div>
					</div>

					<div className="row">
						<div className="item">{ userRequest.email }</div>
						<div className="item">{ userRequest.user ? `${ userRequest.user.firstName } ${ userRequest.user.lastName }` : "General" }</div>
					</div>
				</div>
				)) }

				<h2>Users</h2>

				{this.state.users
					.sort((userA, userB) => userA.firstName > userB.firstName ? 1 : -1)
					.map(user => (
				<div key={ user.id } className="itemContainer">
					<div className="row">
						<div className="item">{ `${ user.firstName } ${ user.lastName }` }</div>
					</div>
					
					<div className="row">
						<div className="item">{ user.lastAccessed ? `${ user.lastAccessed.toLocaleDateString() } ${ user.lastAccessed.toLocaleTimeString() }` : "Not Accessed" }</div>
						<div className="item">{ user.devices ? user.devices.length : 0 } devices</div>
					</div>
				</div>
					))}

			</div>
			}
			
			<div className="floatingButtonContainer">
				<div className="floatingButton active" onClick={ () => {  }}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
					</svg>
				</div>
			</div>

			{
			this.state.selectedRequest ?
				<RequestEditPopup userRequest={ this.state.selectedRequest } users={ this.state.users } close={ () => { this.setState({ selectedRequest: null }) }} />
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	)};

};

ReactDOM.render(<UserManage />, document.getElementById("root"));
