import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Container, Fa, Button } from 'mdb';

import GroupIdBox from './groupIdBox';
import RanksCheckBox from './ranksToRoles';
//import HelpPopover from '../../other/HelpPopover';
import { Accordion, AccordionSection } from '../../other/Accordion';

import ChangeMain from './changeMain';
import BindEditor from './bindEditor';
import TestModal from './TestModal';
import { getGroupInfo, getDiscordRoles } from '../../../util/localStorage';
const { editGroup, getSettings, deleteGroup } = require('settingsManager');
/*
For editng groups!
Key is supplied to container as it forces constructors to re-run when another edit button is clicked.
This contains far far far too much logic, can't be bothered seperating it tho.

*/
export default class EditSection extends Component {
	constructor (p) {
		super(p);
		this.setGroupId = this.setGroupId.bind(this);
		this.deleteGroup = this.deleteGroup.bind(this);
		this.toggleRanksToRoles = this.toggleRanksToRoles.bind(this);
		this.state = {
			info: p.info,
			groupSettings: p.groupSettings
		};
	}
	async componentDidMount(){
		// If already done
		if (this.state.roleArray) {
			return;
		}
		// If its a new group
		if (!this.state.groupSettings || !this.state.groupSettings.id) {
			return;
		}
		var compArray = [];
		// GET BINDS
		const currentSettings = await getSettings();
		if (currentSettings.error) throw new Error(currentSettings.error);

		// GET ROLES
		let discordRoles = await getDiscordRoles();
		if (Array.isArray(discordRoles)) {
			// FOR EACH ROLE
			// Sort
			discordRoles = sort(discordRoles);
			for (let role of discordRoles) {
				if (role.name !== "@everyone") {
					let bindValues = [];
					// SUB GROUP BINDS
					if (this.state.groupSettings.binds) {
						for (let bind of this.state.groupSettings.binds) {
							if (bind.role === role.id) {
								bindValues.push(bind);
							}
						}
					}

					// "OLD" BINDS:
					if (currentSettings.binds) {
						for (let bind of currentSettings.binds) {
							if (bind.role === role.id && bind.group == this.state.groupSettings.id) {
								bindValues.push(bind);

							}
						}
					}
					let title = (
						<Fragment>

							{role.name} <Fa icon="circle" style={{color: `#${role.color.toString(16).toUpperCase() || `fff`}`}}/>
						</Fragment>
					);
					compArray.push(
						<AccordionSection title={title} key={role.id}>
							<BindEditor bind={bindValues} groupId={this.state.groupSettings.id} isMain = {this.props.main} roleId={role.id}/>
						</AccordionSection>
					);
				}


			}

			this.setState({roleArray: compArray});
		}
	}
	toggleRanksToRoles (newVal) {
		if (newVal !== undefined) {
			if (this.state.groupSettings && this.state.groupSettings.id) {
				const newState = Object.assign({}, this.state.groupSettings);
				newState.ranksToRoles = newVal;
				editGroup(newState.id, newState);
				this.setState({
					groupSettings: newState
				});
			}
		}
	}
	async setGroupId (newId) {
		if (newId) {
			const groupInfo = await getGroupInfo(newId);
			if (groupInfo.error && !groupInfo.error.redirect) {
				throw new Error(groupInfo.error);
			} else if (groupInfo.redirect) return;

			const groupSettings = {
				id: newId,
				binds: [],
				ranksToRoles: false
			};
			editGroup(newId, groupSettings);
			this.setState({info: groupInfo, groupSettings: groupSettings});
			this.componentDidMount();
		}
	}
	deleteGroup() {
		deleteGroup(this.state.groupSettings.id);
		this.props.close();
	}

	render () {
		if (this.state.groupSettings) {
			let groupId = this.state.groupSettings.id;
			return (
				<Container id="edit">
					<h1>Edit group - <small className="text-muted"> {this.state.info.Name}</small></h1>
					<h4><strong>Group id</strong> {groupId}</h4>

					<hr/>
					<ChangeMain value={this.props.main} groupId={this.state.groupSettings.id}/>
					<Button size="sm" className="mt-0" color="red" onClick={this.deleteGroup}><Fa icon="trash"/> Delete group</Button>

					<hr/>

					{this.props.main ? <h6>This is the main group. It will be used for nickname management.</h6> : null}
					<h4>Ranks to roles</h4>
					<p>Ranks to roles is the simplest way to link your Roblox™ group to your discord. It works on role/rank names. If there is a rank in your group, and a role in your discord with the same names,
						users will be able to claim those roles. For example, if your group has an <code>Owner</code> rank and your discord has an <code>Owner</code> role, if you are ranked <code>Owner</code> you will recieve that role.</p>
					<RanksCheckBox checked={this.state.groupSettings ? this.state.groupSettings.ranksToRoles : false} toggle={this.toggleRanksToRoles}/>

					<h4 className="mb-0 mt-1">Roles in your discord:</h4>
					<small className="text-muted">Click on one to view which ranks are bound to it.</small>
					{this.state.roleArray ?
						<Accordion>
							{this.state.roleArray}
						</Accordion>
						:
						<h5>No discord roles found! Create some first by running the <code>setup</code> command.</h5>
					}
				</Container>);
		}

		return (
			<Container id="edit">
				<h1>Add group</h1>
				<GroupIdBox setId={this.setGroupId}/>
				<hr/>
				<h4>Ranks to roles</h4>
				<p>Ranks to roles is the simplest way to link your Roblox™ group to your discord. It works on role/rank names. If there is a rank in your group, and a role in your discord with the same names,
					users will be able to claim those roles. For example, if your group has an <code>Owner</code> rank and your discord has an <code>Owner</code> role, if you are ranked <code>Owner</code> you will recieve that role.</p>
				<RanksCheckBox checked={this.state.groupSettings ? this.state.groupSettings.ranksToRoles : false} toggle = {this.toggleRanksToRoles}/>

				<h4 className="mb-0 mt-1">Roles in your discord:</h4>
				<small className="text-muted">Set the group id to setup your group.</small>
			</Container>);


	}

}
EditSection.propTypes = {
	info: PropTypes.object,
	groupSettings: PropTypes.object,
	main: PropTypes.bool,
	close: PropTypes.func.isRequired
};

function sort (arr) {
	var i, len = arr.length, el, j;
	for(i = 1; i<len; i++){
		el = arr[i];
		j = i;
		while(j>0 && arr[j-1].position<el.position){
			arr[j] = arr[j-1];
			j--;
		}
		arr[j] = el;
	}
	return arr;
}