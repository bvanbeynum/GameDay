import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import EmailListPopup from "./components/emaillistpopup";
import LocationPopup from "./components/locationpopup";
import "./css/common.css";
import "./css/emailmanage.css";

class EmailManage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			toast: { message: "", type: "info" }
		}
	};

	componentDidMount() {
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
		}

		fetch("/api/emailmanageload")
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
					emails: data.emails.map(email => ({ 
						...email,
						sent: new Date(email.sent),
						sentFormatted: `${ (((new Date(email.sent)).getMonth() + 1) + "").padStart(2, "0") }/${ ((new Date(email.sent)).getDate() + "").padStart(2, "0") }` 
					})),
					emailLists: data.emailLists,
					emailListDelete: [],
					locations: data.locations,
					locationDelete: []
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	};

	addEmailList = name => {
		this.setState(({ emailLists }) => ({
			emailLists: emailLists.concat({ division: this.state.user.division, name: name, members: [] })
		}));
	}

	deleteEmailList = list => {
		this.setState(({ emailLists, emailListDelete }) => ({
			emailListDelete: list.id ? emailListDelete.concat(list.id) : emailListDelete,
			emailLists: emailLists.filter(emailList => list.id ? emailList.id !== list.id : emailList.name !== list.name)
		}));
	}

	addEmailListMember = (list, newMember) => {
		this.setState(({ emailLists }) => ({
			emailLists: emailLists.map(emailList => 
				(list.id && list.id === emailList.id) || (!list.id && list.name === emailList.name) ?
					{ ...emailList, members: emailList.members.concat(newMember) }
				:
					emailList
			)
		}));
	}

	deleteEmailListMember = (list, removeMember) => {
		this.setState(({ emailLists }) => ({
			emailLists: emailLists.map(emailList => 
				(list.id && list.id === emailList.id) || (!list.id && list.name === emailList.name) ?
					{ ...emailList, members: emailList.members.filter(member => removeMember.email !== member.email) }
				:
					emailList
			)
		}));
	}

	saveEmailLists = () => {
		this.setState({ showEmailList: false }, () => {
			fetch(`/api/emailmanagesave`,
				{ method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emaillists: this.state.emailLists, emaillistdelete: this.state.emailListDelete }) }
				)
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.setState({ emailLists: data.emailLists });
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});
	}

	closeEmailLists = () => {
		this.setState({ showEmailList: false }, () => {
			fetch("/api/emailmanageload")
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.setState({ emailLists: data.emailLists, emailListDelete: [] });
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});
	}

	saveLocation = saveLocation => {
		this.setState(({ locations }) => ({
			locations: saveLocation.id ?
					locations.map(location => location.id === saveLocation.id ? saveLocation : location)
				:
					locations.concat(saveLocation)
		}));
	}

	deleteLocation = deleteLocation => {
		this.setState(({ locations, locationDelete }) => ({
			locationDelete: deleteLocation.id ? locationDelete.concat(deleteLocation.id) : locationDelete,
			locations: locations.filter(location => deleteLocation.id ? deleteLocation.id !== location.id : deleteLocation.name !== location.name)
		}));
	}

	saveLocations = () => {
		this.setState({ showLocations: false }, () => {
			fetch(`/api/emailmanagesave`,
				{ method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locations: this.state.locations, locationdelete: this.state.locationDelete }) }
				)
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.setState({ locations: data.locations });
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});
	}

	closeLocations = () => {
		this.setState({ showLocations: false }, () => {
			fetch("/api/emailmanageload")
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.setState({ locations: data.locations, locationDelete: [] });
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});
	}
	
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
			<div className="emailPage">

				<div className="actionsContainer">
					{/* Email List */}
					<div className="actionButton" onClick={ () => { this.setState(({ showEmailList: true })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zm0 16H2V5h20v14zM21 6h-7v5h7V6zm-1 2l-2.5 1.75L15 8V7l2.5 1.75L20 7v1zM9 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.59c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.41zM5.48 16c.74-.5 2.22-1 3.52-1s2.77.49 3.52 1H5.48z"/>
						</svg>
					</div>

					{/* Locations */}
					<div className="actionButton" onClick={ () => { this.setState(({ showLocations: true })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM10 5.47l4 1.4v11.66l-4-1.4V5.47zm-5 .99l3-1.01v11.7l-3 1.16V6.46zm14 11.08l-3 1.01V6.86l3-1.16v11.84z"/>
						</svg>
					</div>
				</div>

				<div className="emailItem">
					<div className="emailSubect">New Email</div>
				</div>

				{
				this.state.emails
				.sort((emailA, emailB) => emailB.sent - emailA.sent)
				.map(email => 
					<div key={ email.id } className="emailItem">
						<div className="emailSubect">{ email.subject }</div>

						<div className="emailDetails">
							<div>To { email.to.length }</div>
							<div>{ email.sentFormatted }</div>
						</div>
					</div>
				)
				}

			</div>
			}

			{
			this.state.showEmailList ?
				<EmailListPopup 
					emailLists={ this.state.emailLists }
					save={ this.saveEmailLists }
					close={ this.closeEmailLists } 
					addEmailList={ this.addEmailList }
					deleteEmailList={ this.deleteEmailList }
					addEmailListMember={ this.addEmailListMember }
					deleteEmailListMember={ this.deleteEmailListMember }
					/>
			: ""
			}

			{
			this.state.showLocations ?
				<LocationPopup
					locations={ this.state.locations }
					save={ this.saveLocations }
					close={ this.closeLocations }
					saveLocation={ this.saveLocation }
					deleteLocation={ this.deleteLocation }
					/>
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	)};

}

ReactDOM.render(<EmailManage />, document.getElementById("root"));
