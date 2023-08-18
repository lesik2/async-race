import { createCar, createHundredCars, drive, startStopRace, updateCar } from '../../../resful api/api';
import { Store } from '../../../store/index';
import { Car, Drive, MARKS_OF_CARS, MODELS_OF_CARS, OmitEngine } from '../../../types/index';
import { MyAnimation } from '../animation/index';
import { Race } from '../race/Race';
import './Panel.scss';
export class Panel {
    private colorPickerEdit: HTMLInputElement;
    private colorPickerCreate: HTMLInputElement;
    private inputCreate: HTMLInputElement;
    private inputEdit: HTMLInputElement;
    private btnCreate: HTMLAnchorElement;
    private btnEdit: HTMLAnchorElement;
    private panel: HTMLDivElement;
    private race: Race;
    private raceBtn: HTMLAnchorElement;
    private resetBtn: HTMLAnchorElement;
    private genereteCarsBtn: HTMLAnchorElement;
    private store: Store;
    constructor(element: Race, store: Store) {
        this.store = store;
        this.race = element;
        this.panel = this.createPanel();
        [this.inputCreate, this.colorPickerCreate, this.btnCreate] = this.addCreateCarPanel();
        [this.inputEdit, this.colorPickerEdit, this.btnEdit] = this.addEditCarPanel();
        if (store.editInputText) {
            this.inputEdit.value = store.editInputText;
            this.undisableElement(this.inputEdit);
            if (this.store.idEditInput) {
                this.inputEdit.dataset.id = this.store.idEditInput;
            }
        }
        if (store.createInputText) {
            this.inputCreate.value = store.createInputText;
        }
        [this.raceBtn, this.resetBtn, this.genereteCarsBtn] = this.addRacePanel();
        this.panel.append(this.createDataListOfCars());
        this.setMouseListenerForBtn(this.btnCreate);
        this.setMouseListenerForBtn(this.btnEdit);
        this.setMouseListenerForBtn(this.raceBtn);
        this.setMouseListenerForBtn(this.resetBtn);
        this.setMouseListenerForBtn(this.genereteCarsBtn);
        this.setListenerForGenerateCarsButton(this.genereteCarsBtn);
        this.setListenerForCreateBtn(this.btnCreate);
        this.setListenerForEditBtn(this.btnEdit);
        this.setListenerForRaceBtn(this.raceBtn);
        this.setListenerForResetBtn(this.resetBtn);
    }
    private setListenerForResetBtn(resetBtn: HTMLAnchorElement) {
        resetBtn.addEventListener('click', async () => {
            if (this.resetBtn.hasAttribute('disabled')) return;
            this.disableElement(this.resetBtn);
            const drives: Drive[] = [];
            for (let i = (this.race.getCurrentPage() - 1) * 7; i < this.race.getCurrentPage() * 7; i += 1) {
                if (this.race.AmountOFCars === i) break;
                const idOfCar = this.race.Cars[i].id;
                const status = 'stopped';
                if (idOfCar) {
                    drives.push({
                        idOfCar,
                        status,
                    });
                }
            }
            await startStopRace(drives);
            this.undisableElement(this.raceBtn);
            this.race.getMessageWrapper().classList.remove('open');
            for (let i = 0; i < drives.length; i += 1) {
                const idOfCar = drives[i].idOfCar;
                const carImg: Element | null = document.querySelector(`.car-img[data-id="${idOfCar}"]`);
                if (carImg && carImg instanceof HTMLElement) {
                    const animation = this.race.getAnimation().find((anim) => anim.id === idOfCar);
                    if (animation) {
                        animation.animationCar.stopAnimation();
                        carImg.style.left = 55 + 'px';
                    }
                }
            }
        });
    }
    private setListenerForRaceBtn(raceBtn: HTMLAnchorElement) {
        raceBtn.addEventListener('click', async () => {
            if (this.raceBtn.hasAttribute('disabled')) return;
            this.disableElement(this.raceBtn);
            const drives: Drive[] = [];
            for (let i = (this.race.getCurrentPage() - 1) * 7; i < this.race.getCurrentPage() * 7; i += 1) {
                if (this.race.AmountOFCars === i) break;
                const idOfCar = this.race.Cars[i].id;
                const status = 'started';
                if (idOfCar) {
                    drives.push({
                        idOfCar,
                        status,
                    });
                }
            }
            const result: OmitEngine[] | undefined = await startStopRace(drives);
            if (result) {
                for (let i = 0; i < result.length; i += 1) {
                    const duration = Math.round(result[i].distance / result[i].velocity);
                    const idOfCar = drives[i].idOfCar;
                    const carImg: Element | null = document.querySelector(`.car-img[data-id="${idOfCar}"]`);
                    const animation = this.race.getAnimation().find((anim) => anim.id === idOfCar);
                    if (animation && carImg && carImg instanceof HTMLElement) {
                        animation.animationCar.animate(carImg, duration);
                    } else {
                        const animationCar = new MyAnimation();
                        this.race.getAnimation().push({ animationCar, id: idOfCar });
                        if (carImg && carImg instanceof HTMLElement) {
                            animationCar.animate(carImg, duration);
                        }
                    }
                }
                drives.forEach((drive) => (drive.status = 'drive'));
                drive(drives, this.race, result, this.resetBtn);
            }
        });
    }
    private setListenerForEditBtn(btnEdit: HTMLAnchorElement) {
        btnEdit.addEventListener('click', async () => {
            if (this.inputEdit.hasAttribute('disabled')) return;
            const name = this.inputEdit.value;
            const id = Number(this.inputEdit.dataset.id);
            const color = this.colorPickerEdit.value;
            const result: Car = await updateCar(
                {
                    name,
                    color,
                },
                id
            );
            if (result) {
                this.race.updateCar(result);
            }
        });
    }
    private setListenerForCreateBtn(btnCreate: HTMLAnchorElement) {
        btnCreate.addEventListener('click', async () => {
            let name = this.inputCreate.value;
            if (name === '') {
                name = 'Zhiguli';
            }
            const color = this.colorPickerCreate.value;
            const result: Car | undefined = await createCar({
                name,
                color,
            });
            if (result) {
                this.race.addCar(result);
            }
        });
    }
    private setListenerForGenerateCarsButton(genereteCarsBtn: HTMLAnchorElement) {
        genereteCarsBtn.addEventListener('click', async () => {
            const items: Car[] = [];
            for (let i = 0; i < 100; i += 1) {
                const name = this.getRandomName();
                const color = this.getRandomColor();
                items.push({
                    name,
                    color,
                });
            }
            const cars: Car[] | undefined = await createHundredCars(items);
            if (cars) {
                this.race.addHundredCars(cars);
            }
        });
    }

    private getRandomName(): string {
        return `${MARKS_OF_CARS[Math.floor(Math.random() * MARKS_OF_CARS.length)]} ${
            MODELS_OF_CARS[Math.floor(Math.random() * MODELS_OF_CARS.length)]
        }`;
    }
    private getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }
    private setMouseListenerForBtn(element: HTMLAnchorElement) {
        element.addEventListener('mousedown', () => {
            if (element.hasAttribute('disabled')) return;
            element.classList.add('clicked');
        });
        const removeClicked = () => {
            if (element.hasAttribute('disabled')) return;
            element.classList.remove('clicked');
        };
        element.addEventListener('mouseup', removeClicked);
        element.addEventListener('mouseout', removeClicked);
    }
    public getInputEdit() {
        return this.inputEdit;
    }
    public getInputCreate() {
        return this.inputCreate;
    }
    public getPanel() {
        return this.panel;
    }
    private createPanel() {
        const panel = document.createElement('div');
        panel.classList.add('panel-garage');
        return panel;
    }
    private createDataListOfCars(): HTMLDataListElement {
        const dataList = document.createElement('datalist');
        dataList.id = 'carsnames';
        for (let i = 0; i < MARKS_OF_CARS.length; i += 1) {
            const option = document.createElement('option');
            option.setAttribute('value', MARKS_OF_CARS[i]);
            dataList.append(option);
        }
        return dataList;
    }
    private addCreateCarPanel(): [HTMLInputElement, HTMLInputElement, HTMLAnchorElement] {
        const createPanel = document.createElement('div');
        createPanel.classList.add('create-wrapper');
        const inputCreateCar = document.createElement('input');
        inputCreateCar.setAttribute('type', 'text');
        inputCreateCar.setAttribute('list', 'carsnames');
        inputCreateCar.classList.add('input-panel');
        const createBtn = document.createElement('a');
        createBtn.classList.add('panel-btn');
        createBtn.textContent = 'CREATE';
        const colorPicker = this.createColorPicker();
        createPanel.append(inputCreateCar, colorPicker, createBtn);
        this.panel.append(createPanel);
        return [inputCreateCar, colorPicker, createBtn];
    }
    private createColorPicker(): HTMLInputElement {
        const colorPicker = document.createElement('input');
        colorPicker.setAttribute('type', 'color');
        colorPicker.classList.add('color-picker');
        colorPicker.setAttribute('value', '#ffffff');
        return colorPicker;
    }
    private addEditCarPanel(): [HTMLInputElement, HTMLInputElement, HTMLAnchorElement] {
        const editPanel = document.createElement('div');
        editPanel.classList.add('edit-wrapper');
        const inputEditCar = document.createElement('input');
        inputEditCar.classList.add('edit-input');
        inputEditCar.setAttribute('disabled', '');
        inputEditCar.setAttribute('type', 'text');
        inputEditCar.setAttribute('list', 'carsnames');
        inputEditCar.classList.add('input-panel');
        inputEditCar.classList.add('disabled');
        const editBtn = document.createElement('a');
        editBtn.classList.add('panel-btn');
        editBtn.textContent = 'UPDATE';
        const colorPicker = this.createColorPicker();
        editPanel.append(inputEditCar, colorPicker, editBtn);
        this.panel.append(editPanel);
        return [inputEditCar, colorPicker, editBtn];
    }
    private addRacePanel(): [HTMLAnchorElement, HTMLAnchorElement, HTMLAnchorElement] {
        const racePanel = document.createElement('div');
        racePanel.classList.add('race-panel');
        const raceBtn = document.createElement('a');
        raceBtn.classList.add('panel-btn');
        raceBtn.textContent = 'RACE';
        const resetBtn = document.createElement('a');
        resetBtn.classList.add('panel-btn');
        resetBtn.textContent = 'RESET';
        this.disableElement(resetBtn);
        const genereteCarsBtn = document.createElement('a');
        genereteCarsBtn.classList.add('panel-btn');
        genereteCarsBtn.textContent = 'GENERATE CARS';
        racePanel.append(raceBtn, resetBtn, genereteCarsBtn);
        this.panel.append(racePanel);
        return [raceBtn, resetBtn, genereteCarsBtn];
    }
    private disableElement(element: HTMLElement) {
        element.setAttribute('disabled', '');
        element.classList.add('disabled');
    }
    private undisableElement(element: HTMLElement) {
        element.removeAttribute('disabled');
        element.classList.remove('disabled');
    }
}
