import { deleteCar, deleteWinner, getCars, startStopDrive } from '../../../resful api/api';
import { AnimationCars, CARS_ON_PAGE, Car, Engine } from '../../../types/index';
import finishSvg from '../../../assets/finish.svg';
import './Race.scss';
import { MyAnimation } from '../animation/index';
import { Store } from '../../../store/index';
export class Race {
    private amountOfCars = 0;
    private currentPage = 1;
    private amountOfCarsTag: HTMLSpanElement;
    private currentPageTag: HTMLSpanElement;
    private cars: Car[] = [];
    private page: HTMLElement;
    private editInput: HTMLInputElement | null = null;
    private race: HTMLElement;
    private next: HTMLAnchorElement;
    private prev: HTMLAnchorElement;
    private animation: AnimationCars[] = [];
    private messageWrapper: HTMLDivElement;
    private message: HTMLDivElement;
    private store: Store;
    constructor(container: HTMLElement, amountOfCarsTag: HTMLSpanElement, store: Store) {
        this.store = store;
        this.currentPage = this.store.garagePage;
        this.page = container;
        this.race = document.createElement('div');
        this.race.classList.add('race-wrapper');
        this.page.append(this.race);
        this.amountOfCarsTag = amountOfCarsTag;
        this.currentPageTag = this.createCurrentPageTag();
        this.currentPageTag.textContent = ` #${this.currentPage}`;
        [this.prev, this.next] = this.createNavigationButtons();
        [this.messageWrapper, this.message] = this.createMessageWinner();
        this.disablePrev();
    }
    private createMessageWinner() {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');
        const message = document.createElement('div');
        message.classList.add('message-winner');
        message.textContent = 'Tesla wont first [2.17]!';
        messageWrapper.append(message);
        this.page.append(messageWrapper);
        return [messageWrapper, message];
    }
    private createCurrentPageTag() {
        const currentPage = document.createElement('h2');
        currentPage.classList.add('current-page');
        currentPage.textContent = 'Page';
        const span = document.createElement('span');
        currentPage.append(span);
        this.page.append(currentPage);
        return span;
    }
    public getMessageWrapper() {
        return this.messageWrapper;
    }
    public getMessage() {
        return this.message;
    }
    public setEditInput(input: HTMLInputElement) {
        this.editInput = input;
    }
    public get AmountOFCars() {
        return this.amountOfCars;
    }
    public get Cars() {
        return this.cars;
    }
    public getCurrentPage() {
        return this.currentPage;
    }
    public getAnimation() {
        return this.animation;
    }
    public updateCar(car: Car) {
        if (this.editInput) {
            this.cars.forEach((item) => {
                if (item.id === car.id) {
                    item.color = car.color;
                    item.name = car.name;
                }
            });
            const nameTag = document.querySelector(`.car-name[data-id="${car.id}"]`);
            const carImage = document.querySelector(`.car-img[data-id="${car.id}"]`);
            if (nameTag && carImage && carImage instanceof HTMLElement) {
                nameTag.textContent = car.name;
                carImage.style.background = car.color;
            }
            this.editInput.setAttribute('disabled', '');
            this.editInput.classList.add('disabled');
            this.editInput.value = '';
        }
    }
    public addHundredCars(cars: Car[]) {
        this.cars = this.cars.concat(cars);
        this.amountOfCars += cars.length;
        this.amountOfCarsTag.textContent = ` (${this.amountOfCars})`;
        this.race.textContent = '';
        this.showCurrentPage();
        this.undisableNext();
    }
    public addCar(car: Car) {
        this.cars.push(car);
        this.amountOfCars += 1;
        this.amountOfCarsTag.textContent = ` (${this.amountOfCars})`;
        if (this.currentPage * CARS_ON_PAGE >= this.amountOfCars) {
            this.createRoad(car);
        }
        this.undisableNext();
    }
    public async createRoadForCars() {
        this.cars = await getCars();
        this.amountOfCars = this.cars.length;
        this.amountOfCarsTag.textContent = ` (${this.amountOfCars})`;
        this.disableNext();
        this.showCurrentPage();
    }
    private showCurrentPage() {
        for (let i = (this.currentPage - 1) * 7; i < this.currentPage * 7; i += 1) {
            if (this.amountOfCars === i) break;
            this.createRoad(this.cars[i]);
        }
    }
    private createNavigationButtons(): [HTMLAnchorElement, HTMLAnchorElement] {
        const navigation = document.createElement('div');
        navigation.classList.add('navigation');
        const prev = document.createElement('a');
        prev.addEventListener('click', () => {
            if (prev.hasAttribute('disabled')) return;
            this.currentPage -= 1;
            this.currentPageTag.textContent = ` #${this.currentPage}`;
            this.disablePrev();
            this.undisableNext();
            this.race.textContent = '';
            this.showCurrentPage();
        });
        this.setMouseListenerForBtn(prev);
        prev.textContent = 'PREV';
        prev.classList.add('choose-btn');
        const next = document.createElement('a');
        next.addEventListener('click', () => {
            if (next.hasAttribute('disabled')) return;
            this.currentPage += 1;
            this.currentPageTag.textContent = ` #${this.currentPage}`;
            this.undisablePrev();
            this.disableNext();
            this.race.textContent = '';
            this.showCurrentPage();
        });
        this.setMouseListenerForBtn(next);
        next.textContent = 'NEXT';
        next.classList.add('choose-btn');
        navigation.append(prev, next);
        this.page.append(navigation);
        return [prev, next];
    }
    private setMouseListenerForBtn(element: HTMLAnchorElement) {
        element.addEventListener('mousedown', () => {
            if (element.hasAttribute('disabled')) return;
            element.classList.add('clicked');
        });
        const removeClicked = () => {
            element.classList.remove('clicked');
        };
        element.addEventListener('mouseup', removeClicked);
        element.addEventListener('mouseout', removeClicked);
    }
    private async removeCar(remove: HTMLAnchorElement) {
        remove.addEventListener('click', async () => {
            const id = Number(remove.dataset.id);
            const result = await deleteCar(id);
            deleteWinner(id);
            if (result) {
                const road: Element | null = document.querySelector(`.road[data-id="${id}"]`);
                if (road) {
                    road.remove();
                }
                this.amountOfCars -= 1;
                this.amountOfCarsTag.textContent = ` (${this.amountOfCars})`;
                const index = this.cars.findIndex((car) => car.id === id);
                const indexOfAnimation = this.animation.findIndex((anim) => anim.id === id);
                if (index !== -1) {
                    this.cars.splice(index, 1);
                }
                if (indexOfAnimation !== -1) {
                    this.animation.splice(indexOfAnimation, 1);
                }
                if ((this.currentPage - 1) * CARS_ON_PAGE === this.amountOfCars) {
                    if (this.amountOfCars === 0) return;
                    this.currentPage -= 1;
                    this.currentPageTag.textContent = ` #${this.currentPage}`;
                    this.showCurrentPage();
                    this.disableNext();
                    this.disablePrev();
                }
                if (this.cars.length >= this.currentPage * CARS_ON_PAGE) {
                    this.race.textContent = '';
                    this.showCurrentPage();
                    this.disableNext();
                }
            }
        });
    }
    private undisablePrev() {
        if (this.currentPage !== 1) {
            this.undisableElement(this.prev);
        }
    }
    private undisableNext() {
        if (this.amountOfCars > this.currentPage * CARS_ON_PAGE) {
            this.undisableElement(this.next);
        }
    }
    private disablePrev() {
        if (this.currentPage === 1) {
            this.disableElement(this.prev);
        }
    }
    private disableNext() {
        if (this.currentPage * CARS_ON_PAGE >= this.amountOfCars) {
            this.disableElement(this.next);
        }
    }
    private createRoad(car: Car) {
        const road = document.createElement('div');
        road.dataset.id = car.id?.toString();
        road.classList.add('road');
        const editor = document.createElement('div');
        editor.classList.add('editor');
        const name = document.createElement('span');
        name.dataset.id = car.id?.toString();
        name.classList.add('car-name');
        name.textContent = car.name;
        const select = document.createElement('a');
        select.dataset.id = car.id?.toString();
        this.setMouseListenerForBtn(select);
        select.textContent = 'SELECT';
        select.classList.add('car-select');
        select.classList.add('choose-btn');
        const remove = document.createElement('a');
        this.removeCar(remove);
        this.setMouseListenerForBtn(remove);
        remove.dataset.id = car.id?.toString();
        remove.textContent = 'REMOVE';
        remove.classList.add('car-remove');
        remove.classList.add('choose-btn');
        const race = document.createElement('div');
        race.classList.add('race');
        const start = document.createElement('button');
        start.dataset.id = car.id?.toString();
        start.textContent = 'A';
        start.classList.add('car-start');
        start.classList.add('game-btn');
        const end = document.createElement('button');
        end.dataset.id = car.id?.toString();
        this.disableElement(end);
        end.textContent = 'B';
        end.classList.add('car-end');
        end.classList.add('game-btn');
        const carImage = document.createElement('div');
        carImage.dataset.id = car.id?.toString();
        carImage.classList.add('car-img');
        carImage.style.background = car.color;
        const finish = document.createElement('img');
        finish.classList.add('finish-svg');
        finish.src = finishSvg;
        finish.setAttribute('alt', 'finish of the race');
        this.setListnerForSelectButton(select);
        this.setListenerForStarButton(start, end, carImage);
        this.setListenerForEndButton(end, start);
        editor.append(select, remove, name);
        race.append(start, end, carImage, finish);
        road.append(editor, race);
        this.race.append(road);
    }
    private setListnerForSelectButton(select: HTMLAnchorElement) {
        select.addEventListener('click', () => {
            const id = Number(select.dataset.id);
            let name: string | null;
            const nameTag = document.querySelector(`.car-name[data-id="${id}"]`);
            if (nameTag) {
                name = nameTag.textContent;
                if (name && this.editInput) {
                    this.editInput.value = name;
                    this.editInput.dataset.id = id.toString();
                    this.editInput.removeAttribute('disabled');
                    this.editInput.classList.remove('disabled');
                }
            }
        });
    }
    private setListenerForEndButton(end: HTMLButtonElement, start: HTMLButtonElement) {
        end.addEventListener('click', async () => {
            if (end.hasAttribute('disabled')) return;
            this.disableElement(end);
            this.undisableElement(start);
            const idOfCar = Number(end.dataset.id);
            const status = 'stopped';
            await startStopDrive({
                idOfCar,
                status,
            });
            const carImg: Element | null = document.querySelector(`.car-img[data-id="${idOfCar}"]`);
            if (carImg && carImg instanceof HTMLElement) {
                const animation = this.animation.find((anim) => anim.id === idOfCar);
                if (animation) {
                    animation.animationCar.stopAnimation();
                    carImg.style.left = 55 + 'px';
                }
            }
        });
    }
    private setListenerForStarButton(start: HTMLButtonElement, end: HTMLButtonElement, carImage: HTMLDivElement) {
        start.addEventListener('click', async () => {
            if (start.hasAttribute('disabled')) return;
            this.disableElement(start);
            this.undisableElement(end);
            const idOfCar = Number(start.dataset.id);
            const status = 'started';
            const engine: Engine | undefined | number = await startStopDrive({
                idOfCar,
                status,
            });
            if (typeof engine === 'number') return;
            if (engine && engine.distance && engine.velocity) {
                const status = 'drive';
                const duration = Math.round(engine.distance / engine.velocity);
                const animation = this.animation.find((anim) => anim.id === idOfCar);
                if (animation) {
                    animation.animationCar.animate(carImage, duration);
                } else {
                    const animationCar = new MyAnimation();
                    this.animation.push({ animationCar, id: idOfCar });
                    animationCar.animate(carImage, duration);
                }
                const result: Engine | undefined | number = await startStopDrive({
                    idOfCar,
                    status,
                });
                if (typeof result === 'number' && result === 500) {
                    const animation = this.animation.find((anim) => anim.id === idOfCar);
                    if (animation) {
                        animation.animationCar.stopAnimation();
                    }
                }
            }
        });
    }
    private disableElement(element: HTMLElement) {
        element.setAttribute('disabled', '');
        element.classList.add('disabled');
    }
    public undisableElement(element: HTMLElement) {
        element.removeAttribute('disabled');
        element.classList.remove('disabled');
    }
}
