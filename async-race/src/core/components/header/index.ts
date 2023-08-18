import { Buttons } from '../../../types/index';
import Component from '../../templates/components';
import './header.scss';
class Header extends Component {
    constructor(tagName: string, className: string) {
        super(tagName, className);
    }

    private renderPageButtons() {
        const pageButtons = document.createElement('div');
        pageButtons.classList.add('header-wrapper');
        Buttons.forEach((button) => {
            const buttonHTML = document.createElement('a');
            this.setMouseListenerForHeaderLink(buttonHTML);
            buttonHTML.classList.add('header-link');
            buttonHTML.href = `#${button.id}`;
            buttonHTML.textContent = button.text;
            pageButtons.append(buttonHTML);
        });
        this.container.append(pageButtons);
    }
    private setMouseListenerForHeaderLink(element: HTMLAnchorElement) {
        element.addEventListener('mousedown', () => {
            element.classList.add('clicked');
        });
        const removeClicked = () => {
            element.classList.remove('clicked');
        };
        element.addEventListener('mouseup', removeClicked);
        element.addEventListener('mouseout', removeClicked);
    }
    public render() {
        this.renderPageButtons();
        return this.container;
    }
}

export default Header;
