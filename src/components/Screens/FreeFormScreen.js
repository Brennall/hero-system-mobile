import React, { Component }  from 'react';
import { StyleSheet, View, Image, AsyncStorage } from 'react-native';
import { Container, Content, Button, Text } from 'native-base';
import Slider from '../Slider/Slider';
import Header from '../Header/Header';
import { dieRoller } from '../../lib/DieRoller';
import styles from '../../Styles';

export default class HitScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dice: 1,
			halfDice: 0,
			pips: 0
		}
		
		this.setSliderState = this._setSliderState.bind(this);
	}
	
	componentDidMount() {
	    AsyncStorage.getItem('freeFormState').then((value) => {
	    	if (value !== undefined) {
	    		this.setState(JSON.parse(value));
	    	}
	    }).done();
	}
	
	_setSliderState(key, value) {
		let newState = {...this.state};
		newState[key] = value;
		
		AsyncStorage.setItem('freeFormState', JSON.stringify(newState));
		
        this.setState(newState);
	}
	
	render() {
		return (
			<Container style={styles.container}>
				<Header navigation={this.props.navigation} />
				<Content style={styles.content}>
					<Slider 
						label='Dice:'
						value={this.state.dice} 
						step={1} 
						min={0} 
						max={50}
						onValueChange={this.setSliderState}
						valueKey='dice' />
					<Slider 
						label='Half Dice:'
						value={this.state.halfDice} 
						step={1} 
						min={0} 
						max={50}
						onValueChange={this.setSliderState}
						valueKey='halfDice' />
					<Slider 
						label='Pips:'
						value={this.state.pips} 
						step={1} 
						min={0} 
						max={100}
						onValueChange={this.setSliderState}
						valueKey='pips' />
					<Button block style={styles.button} onPress={() => this.props.navigation.navigate('Result', dieRoller.freeFormRoll(this.state.dice, this.state.halfDice, this.state.pips))}>
						<Text>Roll</Text>
					</Button>
				</Content>
			</Container>
		);
	}
}