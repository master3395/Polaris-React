// Seperate to allow for much smaller reloading of component.
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Fa } from 'mdb';
import { getGroupInfo } from '../../../util/localStorage';
export default class BindEditor extends Component {
	constructor (p) {
		super(p);
		this.handleExcChange = this.handleExcChange.bind(this);
		this.handleRankChange = this.handleRankChange.bind(this);
		this.editDone = this.editDone.bind(this);
		this.rmv = this.rmv.bind(this);

		this.state = {rankName: false, rank: this.props.rank, exclusive: this.props.exclusive || true, editing: this.props.rank ? false : true};
	}
	async componentDidMount () {
		const info = await getGroupInfo(this.props.groupId);
		if (info.error) throw new Error(info.error);

		if (this.props.rank) {
			if (info.Roles) {
				for (let current of info.Roles) {
					if (current.Rank === this.props.rank) {
						this.setState({rankName: current.Name});
						return;
					}
				}
				this.setState({rankName: "Rank not found"});
			}

		} else {
			// Rank isn't set; It's blank.
			let rankArr = [];
			for (let current of info.Roles) {
				rankArr.push(<option key={`${current.Name}-${current.Rank}`}>{current.Name}</option>);
			}
			this.setState({rankArr: rankArr});
		}

	}

	handleExcChange(event) {
		if (event.target.value === "Yes" || !event.target.value) {
			this.setState({exclusive: true}, ()=>console.log(`Set to ${this.state.exclusive}`));
		} else if (event.target.value === "No") {
			this.setState({exclusive: false}, ()=>console.log(`Set to ${this.state.exclusive}`));
		} else throw new Error('Invalid option!');
	}

	async handleRankChange(event) {
		this.setState({rankName: event.target.value});
	}
	async editDone () {
		const info = await getGroupInfo(this.props.groupId);
		if (!info.Roles || info.error) throw new Error('No roles!');
		for (let current of info.Roles) {
			if (current.Name === this.state.rankName) {
				this.props.save({
					rank: current.Rank,
					exclusive: this.state.exclusive
				});
				return;
			} else console.log(`${current.Name} :-: ${this.state.rankName}`);
		}
		alert("Could not find the role. Was it deleted, or renamed?");


	}
	rmv () {
		this.props.rmv(this.props.pos);
	}
	render () {
		if (!this.state.editing) {
			// Normal
			return (

				<tr>
					<th scope="row">
						{
							this.props.rank
						}

					</th>
					<td>{this.state.rankName ? this.state.rankName : "Loading..."}</td>
					<td>{this.props.exclusive ? <Fa icon="check" className="text-success"/> : <Fa icon="times" className="text-danger"/> }</td>
					<td>
						<Fa icon="trash" className="clickCursor" onClick={this.rmv}/>
					</td>
				</tr>

			);

		} else {
			return (

				<tr>
					<th scope="row">
						...
					</th>

					<td>
						<select className="form-control mx-50" value={this.state.rankName} onChange={this.handleRankChange}>
							<option>None selected</option>
							{this.state.rankArr ? this.state.rankArr : null}
						</select>
					</td>

					<td>
						<select className="form-control" value={this.state.exclusive ? "Yes" : "No"} onChange={this.handleExcChange}>
							<option>Yes</option>
							<option>No</option>
						</select>
					</td>


					<td>
						<Fa icon="check" className="clickCursor mr-1" onClick={this.editDone}/>
						<Fa icon="ban" className="clickCursor" onClick={this.props.cancel}/>
					</td>
				</tr>

			);
		}

	}

}
BindEditor.propTypes = {
	rank: PropTypes.number,
	exclusive: PropTypes.bool,
	groupId: PropTypes.number,
	save: PropTypes.func.isRequired,
	rmv: PropTypes.func,
	cancel: PropTypes.func,
	pos: PropTypes.number
};
