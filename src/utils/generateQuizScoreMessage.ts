export function generateQuizScoreMessage(score: number): string {
	if (score === 100) {
		return "Perfect score! Congratulations on a flawless performance.";
	} else if (score >= 90) {
		return "Excellent work! You've mastered most of the material.";
	} else if (score >= 75) {
		return "Good job! You have a solid understanding of the material.";
	} else if (score >= 60) {
		return "Not bad, but there's room for improvement. Review the material and try again!";
	} else if (score >= 50) {
		return "You're getting there, but you might need to study a bit more.";
	} else {
		return "It looks like you might need to spend some more time with the material. Don't give up!";
	}
}
