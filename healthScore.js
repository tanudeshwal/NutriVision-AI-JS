function calculateHealthScore(nutrition) {

    if (!nutrition || nutrition.calories <= 0) {
        return null;
    }

    let score = 60;

    const benefits = [];
    const suggestions = [];

    const protein = nutrition.protein * 100 / nutrition.calories;
    const fiber = nutrition.fiber * 100 / nutrition.calories;
    const fat = nutrition.fat * 9 * 100 / nutrition.calories;
    const sugar = nutrition.sugar * 4 * 100 / nutrition.calories;

    if (protein >= 5) {
        score += 15;
        benefits.push("Good protein density");
    } else {
        suggestions.push("Consider adding a protein-rich food.");
    }

    if (fiber >= 2) {
        score += 15;
        benefits.push("Good dietary fiber density");
    } else {
        suggestions.push("Consider adding vegetables or other fiber-rich foods.");
    }

    if (fat <= 30) {
        score += 5;
    } else if (fat > 40) {
        score -= 15;
        suggestions.push("Consider the amount and type of fat.");
    }

    if (sugar <= 10) {
        score += 5;
    } else if (sugar > 20) {
        score -= 15;
        suggestions.push("Consider the source and amount of sugar.");
    }

    score = Math.max(0, Math.min(100, score));

    let rating;
    let color;

    if (score >= 80) {
        rating = "Very Good";
        color = "#087f68";
    } else if (score >= 65) {
        rating = "Good";
        color = "#65a30d";
    } else if (score >= 45) {
        rating = "Moderate";
        color = "#eab308";
    } else {
        rating = "Needs Balance";
        color = "#ea580c";
    }

    return {
        score,
        rating,
        color,
        benefits,
        suggestions
    };
}

module.exports = { calculateHealthScore };