import Page from '../../core/templates/page';
import { getCar, getWinners } from '../../resful api/api';
import { Store } from '../../store/index';
import { COLUMNS, Car, NameOfPage, WINNERS_ON_PAGE, WinTimeSort, Winner, columnOfTable } from '../../types/index';
import './winners.scss';
class WinnersPage extends Page {
    private amountOfWinnersTag: HTMLSpanElement;
    private currentPage = 1;
    private winners: Winner[] = [];
    private next: HTMLAnchorElement;
    private prev: HTMLAnchorElement;
    private currentPageTag: HTMLSpanElement;
    private amountOfWinners = 0;
    private tableOfWinners: HTMLTableElement;
    private countClicksWins = 0;
    private store: Store;
    constructor(id: string, store: Store) {
        super(id);
        this.store = store;
        this.currentPage = store.winnerPage;
        this.currentPageTag = this.createCurrentPageTag();
        this.currentPageTag.textContent = ` #${this.currentPage}`;
        this.amountOfWinnersTag = document.createElement('span');
        this.tableOfWinners = document.createElement('table');
        this.tableOfWinners.classList.add('table-winners');
        this.createTableForWinners();
        [this.prev, this.next] = this.createNavigationButtons();
    }
    public getCurrentPage() {
        return this.currentPage;
    }
    static TextObject = {
        MainTitle: NameOfPage.Winners,
    };
    public async fillTableForWinners() {
        this.winners = await getWinners();
        this.amountOfWinners = this.winners.length;
        this.amountOfWinnersTag.textContent = ` (${this.amountOfWinners})`;
        this.disableNext();
        this.disablePrev();
        this.showCurrentPage(this.winners);
    }
    private async showCurrentPage(winners: Winner[]) {
        for (let i = (this.currentPage - 1) * WINNERS_ON_PAGE; i < this.currentPage * WINNERS_ON_PAGE; i += 1) {
            if (this.amountOfWinners === i) break;
            await this.createStringForTable(winners[i], i + 1);
        }
    }
    private async showSortPage(winners: Winner[]) {
        for (let i = 0; i < winners.length; i += 1) {
            await this.createStringForTable(winners[i], (this.currentPage - 1) * WINNERS_ON_PAGE + i + 1);
        }
    }
    private async createStringForTable(winner: Winner, numberOfWinner: number) {
        const tr = document.createElement('tr');
        tr.classList.add('row-table');
        const tdNumber = document.createElement('td');
        tdNumber.textContent = numberOfWinner.toString();
        const tdCar = document.createElement('td');
        const carImage = document.createElement('div');
        carImage.classList.add('winner-img');
        const id = winner.id;
        let car: Car | undefined;
        if (id) {
            car = await getCar(id);
            if (car) {
                carImage.style.background = car.color;
            }
        }
        tdCar.append(carImage);
        const tdName = document.createElement('td');
        if (car) {
            tdName.textContent = car.name;
        }
        const tdWins = document.createElement('td');
        tdWins.textContent = winner.wins.toString();
        const tdTime = document.createElement('td');
        tdTime.textContent = winner.time.toString();
        tr.append(tdNumber, tdCar, tdName, tdWins, tdTime);
        this.tableOfWinners.append(tr);
    }
    public render() {
        const title = this.createHeaderTitle(WinnersPage.TextObject.MainTitle);
        title.append(this.amountOfWinnersTag);
        this.container.append(title);
        this.fillTableForWinners();
        return this.container;
    }
    private createCurrentPageTag() {
        const currentPage = document.createElement('h2');
        currentPage.classList.add('current-page');
        currentPage.textContent = 'Page';
        const span = document.createElement('span');
        currentPage.append(span);
        this.container.append(currentPage);
        return span;
    }
    private createTableForWinners() {
        const tr = document.createElement('tr');
        tr.classList.add('table-header');
        for (let i = 0; i < COLUMNS; i += 1) {
            const td = document.createElement('td');
            td.textContent = columnOfTable[i];
            tr.append(td);
            if (columnOfTable[i] === WinTimeSort.Wins) {
                td.classList.add(`header-${columnOfTable[3]}`);
                this.setListenerForSorting(td, columnOfTable[3]);
            }
            if (columnOfTable[i] === WinTimeSort.Time) {
                td.classList.add(`header-${columnOfTable[4]}`);
                this.setListenerForSorting(td, columnOfTable[4]);
            }
        }
        this.tableOfWinners.append(tr);
        this.container.append(this.tableOfWinners);
    }
    private setListenerForSorting(element: HTMLTableCellElement, nameOfColumn: string) {
        element.addEventListener('click', async () => {
            if (WinTimeSort.Wins === nameOfColumn) {
                const time: Element | null = document.querySelector(`.header-${WinTimeSort.Time}`);
                if (time) {
                    time.textContent = WinTimeSort.Time;
                }
            } else {
                const wins: Element | null = document.querySelector(`.header-${WinTimeSort.Wins}`);
                if (wins) {
                    wins.textContent = WinTimeSort.Wins;
                }
            }
            if (this.countClicksWins === 0) {
                this.countClicksWins += 1;
                element.textContent = nameOfColumn + ' ⬆';
                const winnersAsc: Winner[] = await getWinners([
                    { key: '_page', value: this.currentPage },
                    { key: '_limit', value: WINNERS_ON_PAGE },
                    { key: '_sort', value: nameOfColumn.toLowerCase() },
                    { key: '_order', value: 'ASC' },
                ]);
                this.removeRowTable();
                this.showSortPage(winnersAsc);
            } else {
                this.countClicksWins = 0;
                element.textContent = nameOfColumn + ' ⬇';
                const winnersDesc: Winner[] = await getWinners([
                    { key: '_page', value: this.currentPage },
                    { key: '_limit', value: WINNERS_ON_PAGE },
                    { key: '_sort', value: nameOfColumn.toLowerCase() },
                    { key: '_order', value: 'DESC' },
                ]);
                this.removeRowTable();
                this.showSortPage(winnersDesc);
            }
        });
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
            this.removeRowTable();
            this.showCurrentPage(this.winners);
            this.deleteSortingForHeadersTd();
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
            this.removeRowTable();
            this.showCurrentPage(this.winners);
            this.deleteSortingForHeadersTd();
        });
        this.setMouseListenerForBtn(next);
        next.textContent = 'NEXT';
        next.classList.add('choose-btn');
        navigation.append(prev, next);
        this.container.append(navigation);
        return [prev, next];
    }
    private deleteSortingForHeadersTd() {
        const time: Element | null = document.querySelector(`.header-${WinTimeSort.Time}`);
        if (time) {
            time.textContent = WinTimeSort.Time;
        }
        const wins: Element | null = document.querySelector(`.header-${WinTimeSort.Wins}`);
        if (wins) {
            wins.textContent = WinTimeSort.Wins;
        }
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
    private removeRowTable() {
        const length = this.tableOfWinners.children.length;
        const rows = this.tableOfWinners.children;
        let k = 1;
        while (k < length) {
            rows[1].remove();
            k += 1;
        }
    }
    private undisablePrev() {
        if (this.currentPage !== 1) {
            this.undisableElement(this.prev);
        }
    }
    private undisableNext() {
        if (this.amountOfWinners > this.currentPage * WINNERS_ON_PAGE) {
            this.undisableElement(this.next);
        }
    }
    private disablePrev() {
        if (this.currentPage === 1) {
            this.disableElement(this.prev);
        }
    }
    private disableNext() {
        if (this.currentPage * WINNERS_ON_PAGE >= this.amountOfWinners) {
            this.disableElement(this.next);
        }
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

export default WinnersPage;
