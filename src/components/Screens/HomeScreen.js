import React, { Component }  from 'react';
import { connect } from 'react-redux';
import { Platform, StyleSheet, ScrollView, View, ImageBackground, TouchableHighlight } from 'react-native';
import { Container, Content, Button, Text, Spinner, Card, CardItem, Body, Icon } from 'native-base';
import Header from '../Header/Header';
import Heading from '../Heading/Heading';
import { dieRoller } from '../../lib/DieRoller';
import { character } from '../../lib/Character';
import { common } from '../../lib/Common';
import styles from '../../Styles';
import { setCharacter } from '../../reducers/character';

class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            characterLoading: false
        };

        this.startLoad = this._startLoad.bind(this);
        this.endLoad = this._endLoad.bind(this);
        this.onLoadPress = this._onLoadPress.bind(this);
    }

    _startLoad() {
        this.setState({characterLoading: true});
    }

    _endLoad() {
        this.setState({characterLoading: false});
    }

    _loadCharacter() {
        character.load(this.startLoad, this.endLoad).then(char => {
            this.props.setCharacter(char);
        });
    }

    _onLoadPress() {
        if (common.isEmptyObject(this.props.character)) {
            common.toast('Please load a character first');
        } else {
            let screen = 'ViewCharacter';

            if (character.isHeroDesignerCharacter(this.props.character)) {
                screen = 'ViewHdCharacter';
            }

            this.props.navigation.navigate(screen);
        }
    }

    _renderViewCharacterButton() {
        if (this.state.characterLoading) {
            return <Spinner color='#D0D1D3' />;
        }

        return (
            <Button style={styles.button}  onPress={() => this.onLoadPress()}>
                <Text uppercase={false} style={styles.buttonText}>View</Text>
            </Button>
        );
    }

	render() {
		return (
		  <Container style={styles.container}>
		    <ImageBackground source={require('../../../public/background.png')} style={{flex: 1}} imageStyle={{ resizeMode: 'cover' }}>
			    <Header navigation={this.props.navigation} />
                <Content style={styles.content}>
                    <Heading text='Character' />
                    <Text style={[styles.grey, {textAlign: 'center'}]}>Import characters from Hero Designer and take them with you when you&quot;re on the go.</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={styles.buttonContainer}>
                            {this._renderViewCharacterButton()}
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button style={styles.button}  onPress={() => this._loadCharacter()}>
                                <Text uppercase={false} style={styles.buttonText}>Load</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{paddingBottom: 20}} />
                    <Heading text='Rolls' />
                    <Text style={[styles.grey, {textAlign: 'center'}]}>Use these tools for rolling dice and doing common tasks within the Hero system.</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={styles.buttonContainer}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('Skill')}>
                                <Text uppercase={false} style={styles.buttonText}>3d6</Text>
                            </Button>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('Hit')}>
                                <Text uppercase={false} style={styles.buttonText}>Hit</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={styles.buttonContainer}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('Damage')}>
                                <Text uppercase={false} style={styles.buttonText}>Damage</Text>
                            </Button>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('FreeForm')}>
                                <Text uppercase={false} style={styles.buttonText}>Free Form</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{paddingBottom: 20}} />
                    <Heading text='Tools' />
                    <Text style={[styles.grey, {textAlign: 'center'}]}>Generate a random 5e character using the Heroic Empowerment Resource Organizer (H.E.R.O.) tool or use the cruncher to calculate power costs.</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={[styles.buttonContainer, {paddingBottom: 20}]}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('RandomCharacter')}>
                                <Text uppercase={false} style={styles.buttonText}>H.E.R.O.</Text>
                            </Button>
                        </View>
                        <View style={[styles.buttonContainer, {paddingBottom: 20}]}>
                            <Button style={styles.button}  onPress={() => this.props.navigation.navigate('CostCruncher')}>
                                <Text uppercase={false} style={styles.buttonText}>Cruncher</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{paddingBottom: 20}} />
                </Content>
            </ImageBackground>
	      </Container>
		);
	}
}

const mapStateToProps = state => {
    return {
        character: state.character
    };
}

const mapDispatchToProps = {
    setCharacter
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
