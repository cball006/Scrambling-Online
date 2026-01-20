export function calculateScore(scores: number[]): number {
    return scores.reduce((total, score) => total + score, 0);
}