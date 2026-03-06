export interface McqOption {
    id: string;
    text: string;
}

export interface McqQuestion {
    id: string;
    question: string;
    options: McqOption[];
    correctOptionId: string;
    explanation: string;
}

export const DUMMY_TEST_QUESTIONS: McqQuestion[] = [
    {
        id: 'q1',
        question: 'Which of the following is an intensive property of a thermodynamic system?',
        options: [
            { id: 'opt1', text: 'Volume' },
            { id: 'opt2', text: 'Mass' },
            { id: 'opt3', text: 'Temperature' },
            { id: 'opt4', text: 'Total Internal Energy' },
        ],
        correctOptionId: 'opt3',
        explanation: 'Temperature is an intensive property because its value does not depend on the amount of substance present in the system, unlike mass or volume.',
    },
    {
        id: 'q2',
        question: 'In an isothermal process for an ideal gas, which quantity remains constant?',
        options: [
            { id: 'opt1', text: 'Pressure' },
            { id: 'opt2', text: 'Volume' },
            { id: 'opt3', text: 'Temperature' },
            { id: 'opt4', text: 'Heat' },
        ],
        correctOptionId: 'opt3',
        explanation: 'By definition, an isothermal process is a change of a system in which the temperature remains constant (ΔT = 0).',
    },
    {
        id: 'q3',
        question: 'What does the First Law of Thermodynamics fundamentally express?',
        options: [
            { id: 'opt1', text: 'The direction of heat flow' },
            { id: 'opt2', text: 'Conservation of energy' },
            { id: 'opt3', text: 'The definition of absolute zero' },
            { id: 'opt4', text: 'Entropy always increases' },
        ],
        correctOptionId: 'opt2',
        explanation: 'The First Law of Thermodynamics states that energy cannot be created or destroyed, only transformed—this is the principle of conservation of energy.',
    },
];
