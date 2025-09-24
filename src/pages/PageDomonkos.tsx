import { useState } from "react";
import "./PageDomonkos.css";

function PageDomonkos() {
    // Score
    const [score, setScore] = useState(0);

    // Upgrades asdasda
    const [flatBonus, setFlatBonus] = useState(1);
    const [flatCost, setFlatCost] = useState(10);

    const [exponent, setExponent] = useState(1);
    const [expCost, setExpCost] = useState(50);

    const [exponentOfExponent, setExponentOfExponent] = useState(1);
    const [expOfExpCost, setExpOfExpCost] = useState(400);

    // Format numbers for readability
    function formatNumber(num: number): string {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toFixed(2);
    }

    // Calculate score per click
    const scorePerClick = flatBonus * (exponent * exponentOfExponent);

    // Click handler
    function handleClick() {
        setScore(score + scorePerClick);
    }

    // Flat bonus upgrade
    function handleFlatUpgrade() {
        if (score >= flatCost) {
            setScore(score - flatCost);
            setFlatBonus(flatBonus + 1);
            setFlatCost(Math.floor(flatCost * 1.5));
        }
    }

    // Exponent upgrade
    function handleExponentUpgrade() {
        if (score >= expCost) {
            setScore(score - expCost);
            setExponent(parseFloat((exponent * 1.2).toFixed(2)));
            setExpCost(Math.floor(expCost * 2));
        }
    }

    // Exponent-of-exponent upgrade
    function handleExpOfExpUpgrade() {
        if (score >= expOfExpCost) {
            setScore(score - expOfExpCost);
            setExponentOfExponent(parseFloat((exponentOfExponent * 1.1).toFixed(2)));
            setExponent(parseFloat((exponent * exponentOfExponent).toFixed(2)));
            setExpOfExpCost(Math.floor(expOfExpCost * 2));
        }
    }

    return (
        <div className="game-container">
            {/* Main area */}
            <div className="main-area">
                <h1>Score: {formatNumber(score)}</h1>
                <button onClick={handleClick} className="click-button">
                    Click me! (+{formatNumber(scorePerClick)})
                </button>

                {/* Stats panel */}
                <div className="stats">
                    <p>Flat Bonus: {flatBonus}</p>
                    <p>Exponent: {exponent.toFixed(2)}</p>
                    <p>Exponent of Exponent: {exponentOfExponent.toFixed(2)}</p>
                    <p>Score per Click: {formatNumber(scorePerClick)}</p>
                </div>
            </div>

            {/* Upgrades */}
            <div className="upgrade-panel">
                <h2>Upgrades</h2>
                <button
                    onClick={handleFlatUpgrade}
                    disabled={score < flatCost}
                    className="upgrade-button"
                >
                    +1 Flat Bonus (Cost: {formatNumber(flatCost)})
                </button>
                <button
                    onClick={handleExponentUpgrade}
                    disabled={score < expCost}
                    className="upgrade-button"
                >
                    +20% Exponent (Cost: {formatNumber(expCost)})
                </button>
                <button
                    onClick={handleExpOfExpUpgrade}
                    disabled={score < expOfExpCost}
                    className="upgrade-button"
                >
                    +10% Exponent-of-Exponent (Cost: {formatNumber(expOfExpCost)})
                </button>
            </div>
        </div>
    );
}

export default PageDomonkos;
