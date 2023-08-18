import Header from '../core/components/header/index';
import Page from '../core/templates/page';
import { ErrorTypes } from '../types/index';
import GaragePage from '../pages/garage/index';
import ErrorPage from '../pages/error/index';
import WinnersPage from '../pages/winners/index';
import { PageIds } from '../types/index';
import { Store } from '../store/index';

class App {
    private container: HTMLElement;
    private defaultPageId = 'current-page';
    private header: Header;
    private currentPage: Page | null = null;
    private store: Store;
    constructor() {
        this.header = new Header('header', 'header-container');
        this.container = document.body;
        this.store = new Store();
    }
    private renderNewPage(idPage: string, store: Store) {
        const currentPageHTML = document.getElementById(`${this.defaultPageId}`);
        if (currentPageHTML) {
            currentPageHTML.remove();
        }
        let page: Page | null = null;

        if (idPage === PageIds.GaragePage) {
            page = new GaragePage(this.defaultPageId, store);
        } else if (idPage === PageIds.WinnersPage) {
            page = new WinnersPage(this.defaultPageId, store);
        } else {
            page = new ErrorPage(this.defaultPageId, ErrorTypes.Error_404);
        }

        if (page) {
            const pageHTML = page.render();
            this.container.append(pageHTML);
            this.currentPage = page;
        }
    }

    private enableRouteChange() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            localStorage.setItem('page', hash);
            if (this.currentPage && this.currentPage instanceof WinnersPage) {
                this.store.winnerPage = this.currentPage.getCurrentPage();
            }
            if (this.currentPage && this.currentPage instanceof GaragePage) {
                const race = this.currentPage.getRace();
                const panel = this.currentPage.getPanel();
                if (race) {
                    this.store.garagePage = race.getCurrentPage();
                }
                if (panel) {
                    this.store.editInputText = panel.getInputEdit().value;
                    this.store.createInputText = panel.getInputCreate().value;
                    this.store.idEditInput = panel.getInputEdit().dataset.id;
                }
            }
            this.renderNewPage(hash, this.store);
        });
    }
    public start(initialPage: string) {
        this.container.append(this.header.render());
        this.renderNewPage(initialPage, this.store);
        this.enableRouteChange();
    }
}

export default App;
