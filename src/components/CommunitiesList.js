import React, { Component } from "react"
import posed from 'react-pose'
import { mapStyle, googleMapsUrl } from '../constants/uiConstants'
import classNames from 'classnames'

//const parent = pose(element, config)
//items.forEach(item => parent.addChild(item, childConfig))
//parent.set('open')
//
//// React Native
//const Parent = posed.View(config)
//const Child = posed.Image(childConfig)
//
//({ items }) => (
//  <Parent pose="open">
//    {items.map(item => <Child />)}
//  </Parent>
//)

//class CommunitiesList extends Component {
//	render() {
//		let communitiesListClass = classNames({
//			"active": this.props.active,
//			"communities-list": true
//		})
//		return <div className={communitiesListClass}>
//				<div className="community-list-item">Tel Aviv</div>
//				<div className="community-list-item">Haifa</div>
//				<div className="community-list-item">Liverpool</div>
//				<div className="community-list-item">London</div>
//		</div>
//	}
//}

const Sidebar = posed.div({
  open: { x: '-100%', staggerChildren: 200 },
  closed: { x: '0%' }
})

const NavItem = posed.li({
  open: { opacity: 1 },
  closed: { opacity: 0 }
})

const Nav = ({ isOpen, navItems }) => (
  <Sidebar pose={isOpen ? 'open' : 'closed'} className="communities-list">
    <ul>
      {navItems.map(({ url, name }) => (
        <NavItem>
          <a href={url}>{name}</a>
        </NavItem>
      ))}
    </ul>
  </Sidebar>
)

/** Demo setup below **/
const navLinks = [
  { url: '#', name: 'Popmotion' },
  { url: '#', name: 'Pose' },
  { url: '#', name: 'Blog' },
  { url: '#', name: 'GitHub' },
];

class CommunitiesList extends React.Component {
  state = {}



  render() {
  	//conso
    return <Nav isOpen={this.props.active} navItems={navLinks} />;
  }
};

export default CommunitiesList