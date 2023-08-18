import Page from '../../core/templates/page';
import { ErrorTypes, ErrorValues } from '../../types/index';

class ErrorPage extends Page {
    constructor(id: string, errorType: ErrorTypes | string) {
        super(id);
        this.errorType = errorType;
    }
    private errorType: ErrorTypes | string;

    static TextObject: ErrorValues = {
        '404': 'Error! The page was not found.',
    };
    render() {
        const title = this.createHeaderTitle(ErrorPage.TextObject[this.errorType]);
        this.container.append(title);
        return this.container;
    }
}

export default ErrorPage;
