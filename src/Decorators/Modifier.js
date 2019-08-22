import { Alert } from 'react-native';
import CharacterTrait from './CharacterTrait';
import { common } from '../lib/Common';
import { SKILL_ENHANCERS } from '../lib/HeroDesignerCharacter';

export default class Modifier extends CharacterTrait {
    constructor(characterTrait) {
        super(characterTrait.trait, characterTrait.parentTrait);

        this.characterTrait = characterTrait;
        this.modifiers = this._getItemTotalModifiers(this.characterTrait.trait).concat(this._getItemTotalModifiers(this.characterTrait.parentTrait));
    }

    cost() {
        return this.characterTrait.cost();
    }

    activeCost() {
        let activeCost = this.cost() * (1 + this.advantages().reduce((a, b) => a + b.cost, 0));

        return this._roundInPlayersFavor(activeCost);
    }

    realCost() {
        let realCost = this._roundInPlayersFavor(this.activeCost() / (1 - this.limitations().reduce((a, b) => a + b.cost, 0)));

        Alert.alert(JSON.stringify(this.characterTrait.parentTrait));

        if (this.characterTrait.parentTrait !== undefined &&
            SKILL_ENHANCERS.includes(this.characterTrait.parentTrait.xmlid.toUpperCase())) {
            realCost = realCost - 1 === 0 ? 1 : realCost - 1;

        }

        return this._roundInPlayersFavor(realCost);
    }

    label() {
        return this.characterTrait.label();
    }

    definition() {
        return this.characterTrait.definition();
    }

    advantages() {
        return this.modifiers.filter(m => m.cost >= 0);
    }

    limitations() {
        return this.modifiers.filter(m => m.cost < 0);
    }

    _getItemTotalModifiers(trait) {
        let totalModifiers = [];
        let modifierCost = 0;

        if (trait === null || trait === undefined || !trait.hasOwnProperty('modifier')) {
            return totalModifiers;
        }

        if (trait.hasOwnProperty('modifier') && trait.modifier !== undefined) {
            if (Array.isArray(trait.modifier)) {
                for (let modifier of trait.modifier) {
                    if (modifier.hasOwnProperty('multiplier') && !modifier.hasOwnProperty('template')) {
                        continue;
                    }

                    modifierCost = this._getTotalModifiers(modifier);

                    totalModifiers.push({
                        label: this._getModifierLabel(modifier, modifierCost),
                        cost: modifierCost
                    });
                }
            } else {
                if (trait.modifier.hasOwnProperty('multiplier') && !trait.modifier.hasOwnProperty('template')) {
                    return totalModifiers;
                }

                modifierCost = this._getTotalModifiers(trait.modifier);

                totalModifiers.push({
                    label: this._getModifierLabel(trait.modifier, modifierCost),
                    cost: modifierCost
                });
            }
        }

        return totalModifiers;
    }

    _getModifierLabel(modifier, totalModifiers, adders=[]) {
        let label = modifier.alias + (modifier.levels > 0 ? ` x${modifier.levels}` : '');

        if (modifier.hasOwnProperty('optionAlias')) {
            label += `, ${modifier.optionAlias}`;
        }

        if (modifier.hasOwnProperty('adder')) {
            if (Array.isArray(modifier.adder)) {
                for (let adder of modifier.adder) {
                    adders.push(adder.alias + (adder.optionAlias === undefined ? '' : ` ${adder.optionAlias}`));
                }
            } else {
                adders.push(modifier.adder.alias + (modifier.adder.optionAlias === undefined ? '' : ` ${modifier.adder.optionAlias}`));
            }
        }

        if (modifier.hasOwnProperty('modifier')) {
            if (Array.isArray(modifier.modifier)) {
                for (let m of modifier.modifier) {
                    label += `, ${m.alias}`;
                }
            } else {
                label += `, ${modifier.modifier.alias}`;
            }
        }

        if (adders.length > 0) {
            label += ` (${adders.join(', ')})`;
        }

        label += `: ${this._formatCost(totalModifiers)}`;

        return label;
    }

    _getTotalModifiers(modifier) {
        // Damage Over Time is funky and an exception to the norm
        if (modifier.xmlid.toUpperCase() === 'DAMAGEOVERTIME') {
            return this._handleDoT(modifier);
        }

        let basecost = modifier.basecost + (modifier.levels > 0 ? modifier.template.lvlcost * modifier.levels : 0);

        let totalModifiers = this._getAdderTotal(basecost, modifier.modifier, modifier);

        if (modifier.hasOwnProperty('adder')) {
            if (Array.isArray(modifier.adder)) {
                for (let adder of modifier.adder) {
                    totalModifiers += this._getAdderTotal(adder.basecost, modifier.modifier, modifier) || 0;
                }
            } else {
                totalModifiers += this._getAdderTotal(modifier.adder.basecost, modifier.modifier, modifier) || 0;
            }
        }

        return totalModifiers;
    }

    _getAdderTotal(cost, subModifier, modifier) {
        let totalAdderCost = cost;

        if (subModifier !== undefined) {
            if (Array.isArray(subModifier)) {
                for (let mod of subModifier) {
                    totalAdderCost += this._getAdderTotal(mod.cost, mod, modifier);
                }
            } else {
                totalAdderCost *= 2;
            }
        }

        return totalAdderCost;
    }

    _handleDoT(modifier) {
        let totalCost = modifier.basecost;
        let incrementCost = this._getAdderByXmlId('INCREMENTS', modifier.adder).basecost || 0;
        let timeCost = this._getAdderByXmlId('TIMEBETWEEN', modifier.adder).basecost || 0;

        if (modifier.modifier !== undefined) {
            if (Array.isArray(modifier.modifier)) {
                for (let mod of modifier.modifier) {
                    if (mod.xmlid.toUpperCase() === 'ONEDEFENSE') {
                        incrementCost *= 2;
                    } else if (mod.xmlid.toUpperCase() === 'LOCKOUT') {
                        if (timeCost > 0) {
                            timeCost = 0;
                        } else {
                            timeCost *= 2;
                        }
                    }
                }
            } else {
                if (modifier.modifier.xmlid.toUpperCase() === 'ONEDEFENSE') {
                    incrementCost *= 2;
                } else if (modifier.modifier.xmlid.toUpperCase() === 'LOCKOUT') {
                    if (timeCost > 0) {
                        timeCost = 0;
                    } else {
                        timeCost *= 2;
                    }
                }
            }
        }

        return totalCost + incrementCost + timeCost;
    }

    _getAdderByXmlId(xmlId, adders) {
        for (let adder of adders) {
            if (adder.xmlid.toUpperCase() === xmlId.toUpperCase()) {
                return adder;
            }
        }

        return null;
    }

    _roundInPlayersFavor(toBeRounded) {
        let rounded = toBeRounded;

        if (common.isFloat(toBeRounded)) {
            if ((toBeRounded % 1).toFixed(1) === '0.5') {
                rounded = Math.trunc(toBeRounded);
            } else {
                rounded = Math.round(toBeRounded);
            }
        }

        return rounded;
    }

    _formatCost(cost) {
        let formattedCost = cost < 0 ? '' : '+';

        formattedCost += Math.trunc(cost) === 0 ? '' : Math.trunc(cost);

        switch ((cost % 1).toFixed(2)) {
            case '0.25':
            case '-0.25':
                formattedCost += '¼';
                break;
            case '0.50':
            case '-0.50':
                formattedCost += '½';
                break;
            case '0.75':
            case '-0.75':
                formattedCost += '¾';
                break;
        }

        if (cost < 0 && !formattedCost.startsWith('-')) {
            formattedCost = `-${formattedCost}`;
        }

        return formattedCost;
    }
}