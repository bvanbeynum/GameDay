import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/email.css";

class EmailEdit extends Component {
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

		const queryString = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) });
		
		fetch(`/api/emaileditload${ queryString.id ? `?id=${ queryString.id }` : "" }`)
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
					emailBody: (data.emailText || "").replace(/cid:([^"']+)/gi, "/media/email/$1.png"),
					toListId: "",
					emailLists: data.emailLists,
					locations: data.locations,
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	};

	navBack = () => {
		window.location = "/emailmanage.html";
	};

	previewEmail = () => {
		this.setState({ isPreview: true }, () => {
			const frame = document.getElementById("templateView").contentWindow.document;
			frame.open();
			frame.write(this.state.emailBody);
			frame.close();
		})
	};

	chageLocationText = event => {
		const location = this.state.locations.find(location => location.id === event.target.value),
			locationText = `<a href="${ location.map }" target="_new">${ location.name }<br>${ location.address }</a>`;
		
		this.setState({ textToInsert: locationText });
	};

	insertText = () => {
		this.setState(({ emailBody, textToInsert }) => ({
			emailBody: emailBody + textToInsert,
			showInsert: false,
			isPreview: false
		}));
	};

	selectToList = event => {
		this.setState(({emailLists}) => ({ 
			toListId: event.target.value,
			emailTo: emailLists.find(list => list.id === event.target.value).members
		}));
	};

	sendEmail = () => {
		if (!this.state.emailTo) {
			this.setState({ toast: { text: "No group selected to send to", type: "error" } });
			return;
		}
		
		if (!this.state.emailBody) {
			this.setState({ toast: { text: "Email is empty", type: "error" } });
			return;
		}

		const sendEmail = {
			to: this.state.emailTo.map(member => `"${ member.name }" <${ member.email }>`).join(";"),
			text: this.state.emailBody
		};

		fetch(`/api/emaileditsend`,
		{ method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: sendEmail }) }
		)
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(() => {
				this.setState({
					showSend: false,
					emailTo: null,
					toListId: "",
					toast: { text: "Email sent", type: "info" }
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error sending email", type: "error" } });
			});
			
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
				<div className="editContent">
					{
					!this.state.isPreview ?
					<div className="contentContainer">
						<textarea className="email" value={ this.state.emailBody || "" } onChange={ event => this.setState(({email}) => ({ emailBody: event.target.value })) }></textarea>
					</div>
					:
					<div className="contentContainer">
						<iframe id="templateView" className="email"></iframe>
					</div>
					}
				</div>

				<div className="actionBar">
					<div className={ `actionItem ${ !this.state.isPreview ? "disabled" : "" }`}>
						{/* Edit */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { if (this.state.isPreview) { this.setState({ isPreview: false }) }  }}>
							<path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
						</svg>
					</div>
					
					<div className={ `actionItem ${ this.state.isPreview ? "disabled" : "" }`}>
						{/* Preview */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { if (!this.state.isPreview) { this.previewEmail() }  }}>
							<path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zm-2 0v.01L12 13 4 8l8-4.68L19.99 8zM4 18v-7.66l8 5.02 7.99-4.99L20 18H4z"/>
						</svg>
					</div>
					
					<div className={ `actionItem ${ this.state.isPreview ? "disabled" : "" }` }>
						{/* Insert */}
						<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" onClick={ () => { if (!this.state.isPreview) { this.setState({ showInsert: true }) } }}>
							<g><path d="M14,10H3v2h11V10z M14,6H3v2h11V6z M18,14v-4h-2v4h-4v2h4v4h2v-4h4v-2H18z M3,16h7v-2H3V16z"/></g>
						</svg>
					</div>
					
					<div className="actionItem">
						{/* Send */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { this.setState({ showSend: true }) }}>
							<path d="M4.01 6.03l7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4 17.97v-2.22l7.51-1M2.01 3L2 10l15 2-15 2 .01 7L23 12 2.01 3z"/>
						</svg>
					</div>
				</div>
			</div>
			}

			{
			this.state.showInsert ?
			<div className="popupBackground active">
				<div className="popup">
					<div className="popupHeader">
		
						<h2>Insert Content</h2>
		
						{/* Save */}
						<div onClick={ this.insertText } className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
							</svg>
						</div>
						
						{/* Close */}
						<div onClick={ () => { this.setState({ showInsert: false }) } } className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
							</svg>
						</div>
		
					</div>
					
					<div className="popupContainer">
						<div className="popupFormRow">
							<div className="label">Locations:</div>

							<div className="popupFormInput">
								<select value={ this.state.selectedLocationId } onChange={ this.chageLocationText }>
									<option value="">Select</option>
									{
									this.state.locations
									.sort((locationA, locationB) => locationA.name > locationB.name ? 1 : -1)
									.map(location => (
									<option key={ location.id } value={ location.id }>{ location.name }</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
			: ""
			}

			{
			this.state.showSend ?
			<div className="popupBackground active">
				<div className="popup">
					<div className="popupHeader">
		
						<h2>Send Email</h2>
		
						{/* Save */}
						<div onClick={ this.sendEmail } className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
							</svg>
						</div>
						
						{/* Close */}
						<div onClick={ () => { this.setState({ showSend: false }) } } className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
							</svg>
						</div>
		
					</div>
					
					<div className="popupContainer">
						<div className="popupFormRow">
							<div className="label">To:</div>

							<div className="popupFormInput">
								<select value={ this.state.toListId } onChange={ this.selectToList }>
									<option value="">Select</option>
									{
									this.state.emailLists
									.sort((listA, listB) => listA.name > listB.name ? 1 : -1)
									.map(list => (
									<option key={ list.id } value={ list.id }>{ list.name }</option>
									))}
								</select>
							</div>
						</div>

						<div className="popupFormRow">
							<div className="emailTo">
							{
							this.state.emailTo ? this.state.emailTo.map((member, memberIndex) => (
								<span key={ memberIndex }>{ `${ member.name } <${ member.email }>;` }</span>
							)) : "" 
							}
							</div>
						</div>
					</div>
				</div>
			</div>
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	)};
};

ReactDOM.render(<EmailEdit />, document.getElementById("root"));
