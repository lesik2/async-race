import { MyAnimation } from '../pages/garage/animation/index';

export const enum PageIds {
    GaragePage = 'garage-page',
    WinnersPage = 'winners-page',
}
export const enum NameOfPage {
    Garage = 'Garage',
    Winners = 'Winners',
}
export const enum ErrorTypes {
    Error_404 = 404,
}
export const Buttons = [
    {
        id: PageIds.GaragePage,
        text: NameOfPage.Garage,
    },
    {
        id: PageIds.WinnersPage,
        text: NameOfPage.Winners,
    },
];
export type ErrorValues = Record<string, string>;
export interface Car {
    name: string;
    color: string;
    id?: number;
}
export interface Drive {
    idOfCar: number;
    status: 'started' | 'stopped' | 'drive';
}
export interface Engine {
    velocity?: number;
    distance?: number;
    success?: boolean;
}
export type OmitEngine = Required<Omit<Engine, 'success'>>;
export interface Winner {
    id?: number;
    wins: number;
    time: number;
}
export interface AnimationCars {
    animationCar: MyAnimation;
    id: number;
}
export const MARKS_OF_CARS = [
    'Tesla',
    'BMW',
    'Mersedes',
    'Ford',
    'Mazda',
    'Porsche',
    'Honda',
    'Audi',
    'Toyota',
    'Hyundai',
];
export const columnOfTable = ['Number', 'Car', 'Name', 'Wins', 'Time'];
export const COLUMNS = 5;
export const MODELS_OF_CARS = ['Camry', 'DB9', 'DB8', 'Cayene', 'CLK', '5-Series', 'Focus', 'A4', 'A6', 'Corolla'];
export const CARS_ON_PAGE = 7;
export const WINNERS_ON_PAGE = 10;
type Values = number | string;
export type RecordType = Record<string, Values>;
export interface Param {
    key: string;
    value: string | number;
}
export const enum WinTimeSort {
    Wins = 'Wins',
    Time = 'Time',
}
