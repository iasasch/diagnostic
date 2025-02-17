import { Question } from '../types/question';

export const selectNextQuestion = (
  allQuestions: Question[],
  answeredQuestions: number[],
  userAnswers: number[]
): Question => {
  const remainingQuestions = allQuestions.filter(q => !answeredQuestions.includes(q.id));

  if (answeredQuestions.length === 0) {
    // 첫 번째 문제는 중간 난이도(2 또는 3) 중에서 랜덤 선택
    const mediumDifficultyQuestions = remainingQuestions.filter(q => q.difficulty === 2 || q.difficulty === 3);
    if (mediumDifficultyQuestions.length > 0) {
      return mediumDifficultyQuestions[Math.floor(Math.random() * mediumDifficultyQuestions.length)];
    } else {
      // 만약 중간 난이도 문제가 없으면 남은 문제 중에서 랜덤 선택
      return remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
    }
  }

  const lastAnswer = userAnswers[userAnswers.length - 1];
  const lastQuestion = allQuestions.find(q => q.id === answeredQuestions[answeredQuestions.length - 1]);

  // correctAnswer가 1부터 시작하는 경우 인덱스 보정 필요
  const lastQuestionCorrectAnswerIndex = (lastQuestion?.correctAnswer || 1) - 1;

  let isCorrect = lastAnswer === lastQuestionCorrectAnswerIndex;

  // 최근 몇 개의 답변을 고려하여 정답률 계산 (예: 최근 3개)
  const recentAnswers = userAnswers.slice(-3);
  const recentQuestions = answeredQuestions.slice(-3).map(id => allQuestions.find(q => q.id === id)!);
  const recentCorrectAnswers = recentQuestions.map(q => q.correctAnswer - 1);
  const recentScore = recentAnswers.reduce((acc, answer, idx) => acc + (answer === recentCorrectAnswers[idx] ? 1 : 0), 0);
  const recentAccuracy = recentScore / recentAnswers.length;

  // 정답률에 따라 난이도 조정
  let nextDifficulty;
  if (recentAccuracy >= 0.8) {
    // 최근 정답률이 높으면 난이도를 올림
    nextDifficulty = Math.min((lastQuestion?.difficulty || 1) + 1, 4); // 난이도 4가 최대값
  } else if (recentAccuracy <= 0.4) {
    // 최근 정답률이 낮으면 난이도를 내림
    nextDifficulty = Math.max((lastQuestion?.difficulty || 3) - 1, 1); // 난이도 1이 최소값
  } else {
    // 정답률이 중간이면 동일한 난이도 유지
    nextDifficulty = lastQuestion?.difficulty || 2;
  }

  // 남아 있는 문제 중에서 해당 난이도의 문제를 랜덤 선택
  const candidateQuestions = remainingQuestions.filter(q => q.difficulty === nextDifficulty);

  if (candidateQuestions.length > 0) {
    return candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)];
  }

  // 해당 난이도의 문제가 없으면 가장 가까운 난이도의 문제를 선택
  const sortedByDifficulty = remainingQuestions.sort(
    (a, b) => Math.abs(a.difficulty - nextDifficulty) - Math.abs(b.difficulty - nextDifficulty)
  );

  return sortedByDifficulty[0];
};

export const isTestComplete = (answeredQuestions: number[]): boolean => {
  return answeredQuestions.length >= 10;
};