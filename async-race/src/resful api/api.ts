import { Race } from '../pages/garage/race/Race';
import { Car, Drive, Engine, OmitEngine, Param, Winner } from '../types/index';
const baseUrl = 'http://127.0.0.1:3000';
const path = {
    garage: '/garage',
    engine: '/engine',
    winners: '/winners',
};
const generateQueryString = (queryParams: Param[] = []) =>
    queryParams.length ? `${queryParams.map((x) => `${x.key}=${x.value}`).join('&')}` : '';

export const drive = (drives: Drive[], race: Race, calculateTime: OmitEngine[], resetBtn: HTMLAnchorElement) => {
    try {
        let oneWinner = false;
        let numberOfCrush = 0;
        drives.forEach(async (drive, index) => {
            const response = await fetch(`${baseUrl}${path.engine}?id=${drive.idOfCar}&status=${drive.status}`, {
                method: 'PATCH',
            });
            if (response.status === 500) {
                numberOfCrush += 1;
                if (numberOfCrush === drives.length) {
                    race.undisableElement(resetBtn);
                }
                const animation = race.getAnimation().find((anim) => anim.id === drive.idOfCar);
                if (animation) {
                    animation.animationCar.stopAnimation();
                }
            } else {
                if (response.status == 200 && oneWinner === false) {
                    oneWinner = true;
                    const time = calculateTime.map((time) => Math.round(time.distance / time.velocity));
                    const minTime = (time[index] / 1000).toFixed(2);
                    race.undisableElement(resetBtn);
                    const car: Car | undefined = race.Cars.find((car) => car.id === drive.idOfCar);
                    if (car) {
                        race.getMessage().textContent = `${car.name} wont first [${minTime}]!`;
                        race.getMessageWrapper().classList.add('open');
                    }
                    updateDataWinner(minTime, drive);
                }
            }
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
const updateDataWinner = async (minTime: string, drive: Drive) => {
    const Winner: Winner | undefined = await getWinner(drive.idOfCar);
    if (Winner) {
        const newTime = Number(minTime) < Winner.time ? Number(minTime) : Winner.time;
        if (Winner.id) {
            updateWinner(
                {
                    wins: Winner.wins + 1,
                    time: newTime,
                },
                Winner.id
            );
        }
    } else {
        createWinner({
            id: drive.idOfCar,
            wins: 1,
            time: Number(minTime),
        });
    }
};
export const startStopRace = async (drives: Drive[]) => {
    try {
        const requests = drives.map((drive) =>
            fetch(`${baseUrl}${path.engine}?id=${drive.idOfCar}&status=${drive.status}`, {
                method: 'PATCH',
            })
        );
        const responses = await Promise.all(requests);
        const result: OmitEngine[] = await Promise.all(responses.map((r) => r.json()));
        return result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const startStopDrive = async (drive: Drive) => {
    try {
        let result: Engine;
        const response: Response = await fetch(`${baseUrl}${path.engine}?id=${drive.idOfCar}&status=${drive.status}`, {
            method: 'PATCH',
        });
        if (response.ok) {
            result = await response.json();
            return result;
        } else {
            return response.status;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const getCars = async (): Promise<Car[]> => {
    let cars: Car[] = [];
    try {
        const response: Response = await fetch(`${baseUrl}${path.garage}`);
        if (response.ok) {
            cars = await response.json();
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
    return cars;
};
export const getWinners = async (params: Param[] = []): Promise<Winner[]> => {
    let winners: Winner[] = [];
    try {
        const response: Response = await fetch(`${baseUrl}${path.winners}?${generateQueryString(params)}`);
        if (response.ok) {
            winners = await response.json();
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
    return winners;
};
export const getCar = async (id: number) => {
    try {
        const response: Response = await fetch(`${baseUrl}${path.garage}/${id}`);
        if (response.ok) {
            const car: Car = await response.json();
            return car;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const getWinner = async (id: number) => {
    try {
        const response: Response = await fetch(`${baseUrl}${path.winners}/${id}`);
        if (response.ok) {
            const winner: Winner = await response.json();
            return winner;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const createHundredCars = async (Cars: Car[]) => {
    try {
        const requests = Cars.map((car) =>
            fetch(`${baseUrl}${path.garage}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify(car),
            })
        );
        const responses = await Promise.all(requests);
        const result: Car[] = await Promise.all(responses.map((r) => r.json()));
        return result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const createWinner = async (winner: Winner): Promise<Winner | undefined> => {
    try {
        let result: Winner;
        const response: Response = await fetch(`${baseUrl}${path.winners}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(winner),
        });
        if (response.ok) {
            result = await response.json();
            return result;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const createCar = async (Car: Car): Promise<Car | undefined> => {
    try {
        let result: Car;
        const response: Response = await fetch(`${baseUrl}${path.garage}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(Car),
        });
        if (response.ok) {
            result = await response.json();
            return result;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const deleteCar = async (id: number) => {
    try {
        const response: Response = await fetch(`${baseUrl}${path.garage}/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            return true;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
        return false;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const deleteWinner = async (id: number) => {
    try {
        const response: Response = await fetch(`${baseUrl}${path.winners}/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            return true;
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
        return false;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const updateCar = async (car: Car, id: number) => {
    try {
        let result;
        const response: Response = await fetch(`${baseUrl}${path.garage}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(car),
        });
        if (response.ok) {
            result = await response.json();
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
        return result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
export const updateWinner = async (winner: Winner, id: number) => {
    try {
        let result;
        const response: Response = await fetch(`${baseUrl}${path.winners}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(winner),
        });
        if (response.ok) {
            result = await response.json();
        } else {
            console.log('Ошибка HTTP: ' + response.status);
        }
        return result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
