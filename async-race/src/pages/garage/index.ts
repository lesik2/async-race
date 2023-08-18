import Page from '../../core/templates/page';
import { Store } from '../../store/index';
import { NameOfPage } from '../../types/index';
import './garage.scss';
import { Panel } from './panel/Panel';
import { Race } from './race/Race';
class GaragePage extends Page {
    private store: Store;
    private race: Race | null = null;
    private panel: Panel | null = null;
    constructor(id: string, store: Store) {
        super(id);
        this.store = store;
    }
    static TextObject = {
        MainTitle: NameOfPage.Garage,
    };
    public getRace() {
        return this.race;
    }
    public getPanel() {
        return this.panel;
    }
    public render() {
        const title = this.createHeaderTitle(GaragePage.TextObject.MainTitle);
        const amountOfCarsTag = document.createElement('span');
        title.append(amountOfCarsTag);
        this.container.append(title);
        const race = new Race(this.container, amountOfCarsTag, this.store);
        race.createRoadForCars();
        const panel = new Panel(race, this.store);
        this.container.append(panel.getPanel());
        race.setEditInput(panel.getInputEdit());
        this.race = race;
        this.panel = panel;
        return this.container;
    }
}

export default GaragePage;
