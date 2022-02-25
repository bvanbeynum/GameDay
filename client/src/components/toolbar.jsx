import React, { useState } from "react";
import "../css/toolbar.css";

const Toolbar = (props) => {

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const openMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const openItem = (url) => {
		window.location = url;
	};

	return (
		<div className="toolbar">
			<div className="toolbarButton">
			{
			props.teamName ?
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" onClick={ () => { props.navBack() } }>
					<path d="M0 0h24v24H0z" fill="none"/>
					<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="black"/>
				</svg>
				: ""
			}
			</div>

			<h2 className="toolbarHeader">Game Day { props.teamName ? " - " + props.teamName : "" }</h2>
			
			{
			props.teamName ?
				<div className="toolbarButton" onClick={ () => { openMenu() } }>
					<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
						<g>
							<g>
								<path d="M17,11c0.34,0,0.67,0.04,1,0.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82c0.55-0.13,1.08-0.32,1.6-0.55 C11.41,19.47,11,18.28,11,17C11,13.69,13.69,11,17,11z"/><path d="M17,13c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C21,14.79,19.21,13,17,13z M17,14.38c0.62,0,1.12,0.51,1.12,1.12 s-0.51,1.12-1.12,1.12s-1.12-0.51-1.12-1.12S16.38,14.38,17,14.38z M17,19.75c-0.93,0-1.74-0.46-2.24-1.17 c0.05-0.72,1.51-1.08,2.24-1.08s2.19,0.36,2.24,1.08C18.74,19.29,17.93,19.75,17,19.75z"/>
							</g>
						</g>
					</svg>
				</div>
			: ""
			}
			
			{
			isMenuOpen ?
				<div className={`adminMenuContainer ${ props.adminMenu.length > 0 ? "active" : "" }` }>
					<div className="adminMenu">
						{
						props.adminMenu
							.sort((itemA, itemB) => itemA.name > itemB.name ? 1 : -1)
							.map((item, itemIndex) => (
							<div key={ itemIndex } className="adminMenuItem" onClick={ () => { openItem(item.url) }}>{ item.name }</div>
						))
						}
					</div>
				</div>
			: ""
			}
		</div>
	);

};

export default Toolbar;