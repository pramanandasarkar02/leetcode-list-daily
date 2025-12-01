export type Problem = {
    id: number;
    lcId : string;
    title: string;
    url: string;
}

export type ProblemStatus = {
    pid: number;
    dailyCount: number;
    daily: string[];
}
