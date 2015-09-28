/**
 * Created by khizh on 9/10/2015.
 */
var React = require('react');
var _ = require('underscore');

var StrengthChecker = React.createClass({

    getInitialState: function () {
        return {
            complexityPoints: 0
        }
    },

    /**
     * @return {boolean}
     */
    ReCalculateAndReturn: function (value) {
        var length = value.length;
        var num = {Upper: 0, Numbers: 0, Symbols: 0, Excess: 0};
        var bonus = {Excess: 3, Upper: 4, Numbers: 5, Symbols: 5, Combo: 0, FlatLower: 0, FlatUpper: 0, FlatNumber: 0};
        if (length) {
            for (var i = 0; i < length; i++) {
                var character = value.charAt(i);
                if (character.match(/[A-Z]/g)) {
                    num.Upper++;
                }
                if (character.match(/[0-9]/g)) {
                    num.Numbers++;
                }
                if (character.match(/(.*[!,@#$%^&*?_~])/)) {
                    num.Symbols++;
                }
            }
        }
        var complexityPoints = 0;
        if (length > 6) complexityPoints = 50;
        num.Excess = length - 6;
        if (num.Upper && num.Numbers && num.Symbols)
            bonus.Combo = 25;
        else if ((num.Upper && num.Numbers) || (num.Upper && num.Symbols) || (num.Numbers && num.Symbols))
            bonus.Combo = 15;
        if (value.match(/^[\sa-z]+$/))
            bonus.FlatLower = -15;
        if (value.match(/^[\sA-Z]+$/))
            bonus.FlatUpper = -15;
        if (value.match(/^[\s0-9]+$/))
            bonus.FlatNumber = -35;
        complexityPoints += (num.Excess * bonus.Excess) + (num.Upper * bonus.Upper) + (num.Numbers * bonus.Numbers) +
            (num.Symbols * bonus.Symbols) + bonus.Combo + bonus.FlatLower + bonus.FlatUpper + bonus.FlatNumber;
        this.setState({complexityPoints: complexityPoints});
        return (complexityPoints >= 70);
    },

    complexityPointsToString: function () {
        if (this.state.complexityPoints < 50) return "Unmet";
        else if (this.state.complexityPoints < 70) return "Low";
        else if (this.state.complexityPoints < 100) return "Medium";
        else if (this.state.complexityPoints >= 100) return "High";
    }
    ,

    render: function () {
        if (this.complexityPointsToString() !== "Unmet")
            return (
                <div>
                    <div
                        className={"strengthChecker "+this.complexityPointsToString()}>{this.complexityPointsToString()}</div>
                </div>
            ); else return (<span></span>)
    }

});
module.exports = StrengthChecker;