import React, { Component }  from 'react';
import { StyleSheet, View, Image, Switch, AsyncStorage } from 'react-native';
import { Container, Content, Button, Text, Picker, Item, CheckBox } from 'native-base';
import Slider from 'react-native-slider';
import Header from '../Header/Header';
import { dieRoller, KILLING_DAMAGE, NORMAL_DAMAGE, PARTIAL_DIE_PLUS_ONE, PARTIAL_DIE_HALF } from '../../lib/DieRoller';
import styles from '../../Styles';

export default class HitScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dice: 12,
			partialDie: 0,
			killingToggled: false,
			damageType: NORMAL_DAMAGE,
			stunMultiplier: 0,
			useHitLocations: false,
			isMartialManeuver: false,
			isTargetFlying: false
		};
		
		this.updateState = this._updateState.bind(this);
		this.toggleDamageType = this._toggleDamageType.bind(this);
	}
	
	componentDidMount() {
	    AsyncStorage.getItem('damageState').then((value) => {
	    	if (value !== undefined) {
	    		this.setState(JSON.parse(value));
	    	}
	    }).done();
	}
	
	_updateState(key, value) {
		let newState = {...this.state};
		newState[key] = value;
		
		AsyncStorage.setItem('damageState', JSON.stringify(newState));
		
        this.setState(newState);
	}
	
	_toggleDamageType() {
		let newState = {...this.state};
		
		if (!this.state.killingToggled) {
			newState.killingToggled = true;
			newState.damageType = KILLING_DAMAGE;
		} else {
			newState.killingToggled = false;
			newState.damageType = NORMAL_DAMAGE;
		}
		
		AsyncStorage.setItem('damageState', JSON.stringify(newState));
		
        this.setState(newState);
	}
	
	_toggleHitLocations() {
		this.updateState('useHitLocations', !this.state.useHitLocations);
	}

	_toggleMartialManeuver() {
		this.updateState('isMartialManeuver', !this.state.isMartialManeuver);
	}

	_toggleTargetFlying() {
		this.updateState('isTargetFlying', !this.state.isTargetFlying);
	}
	
	_renderStunMultiplier() {
		if (this.state.killingToggled) {
			return (
				<View>	
					<View style={localStyles.titleContainer}>
						<Text style={styles.grey}>Stun Multiplier:</Text>
						<Text style={styles.grey}>{this.state.stunMultiplier}</Text>
					</View>						
					<Slider 
						value={this.state.stunMultiplier}
						step={1} 
						minimumValue={-10} 
						maximumValue={10} 
						onValueChange={(value) => this.updateState('stunMultiplier', value)} 
						trackStyle={thumbStyles.track}
						thumbStyle={thumbStyles.thumb}
						minimumTrackTintColor='#3da0ff'
					/>
				</View>
			);
		}
		
		return null;
	}
	
	render() {
		return (
			<Container style={styles.container}>
				<Header navigation={this.props.navigation} />
				<Content style={styles.content}>
					<View style={localStyles.titleContainer}>
						<Text style={styles.grey}>Dice:</Text>
						<Text style={styles.grey}>{this.state.dice}</Text>
					</View>
					<Slider 
						value={this.state.dice}
						step={1} 
						minimumValue={0} 
						maximumValue={50} 
						onValueChange={(value) => this.updateState('dice', value)} 
						trackStyle={thumbStyles.track}
						thumbStyle={thumbStyles.thumb}
						minimumTrackTintColor='#3da0ff'
					/>
					<Picker
					  inlinelabel
					  label='Test'
					  style={styles.grey}
		              iosHeader="Select one"
		              mode="dropdown"
		              selectedValue={this.state.partialDie}
		              onValueChange={(value) => this.updateState('partialDie', value)}
		            >
		              <Item label="No partial die" value="0" />
		              <Item label="+1 pip" value={PARTIAL_DIE_PLUS_ONE} />
		              <Item label="+½ die" value={PARTIAL_DIE_HALF} />
		            </Picker>
		            <View style={{paddingBottom: 30}} />
		            <View style={[localStyles.titleContainer, localStyles.checkContainer]}>
	              	<Text style={styles.grey}>Is this a killing attack?</Text>
		              	<View style={{paddingRight: 10}}>
		              		<CheckBox checked={this.state.killingToggled} onPress={() => this.toggleDamageType()} color='#3da0ff'/>
		              	</View>		            
		            </View>	            
					{this._renderStunMultiplier()}
		            <View style={[localStyles.titleContainer, localStyles.checkContainer]}>
		              	<Text style={styles.grey}>Use hit locations?</Text>
		              	<View style={{paddingRight: 10}}>
		              		<CheckBox checked={this.state.useHitLocations} onPress={() => this._toggleHitLocations()} color='#3da0ff'/>
		              	</View>
		            </View>
		            <View style={[localStyles.titleContainer, localStyles.checkContainer]}>
		              	<Text style={styles.grey}>Are you using a martial maneuver?</Text>
		              	<View style={{paddingRight: 10}}>
		              		<CheckBox checked={this.state.isMartialManeuver} onPress={() => this._toggleMartialManeuver()} color='#3da0ff'/>
		              	</View>
		            </View>
		            <View style={[localStyles.titleContainer, localStyles.checkContainer]}>
		              	<Text style={styles.grey}>Is the target flying?</Text>
		              	<View style={{paddingRight: 10}}>
		              		<CheckBox checked={this.state.isTargetFlying} onPress={() => this._toggleTargetFlying()} color='#3da0ff'/>
		              	</View>
		            </View>
		            <View style={{paddingBottom: 30}} />
					<Button block style={styles.button} onPress={() => this.props.navigation.navigate('Result', dieRoller.rollDamage(this.state))}>
						<Text>Roll</Text>
					</Button>
				</Content>
			</Container>
		);
	}
}

const localStyles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 10
	},
	checkContainer: {
		paddingBottom: 20
	},
	picker: {
		color: '#fff'
	},
	list: {
		paddingBottom: 10
	}
});

const thumbStyles = StyleSheet.create({
	track: {
		height: 16,
		borderRadius: 10,
	},
	thumb: {
		width: 30,
		height: 30,
		borderRadius: 30 / 2,
		backgroundColor: 'white',
		borderColor: '#3da0ff',
		borderWidth: 2,
	}
});