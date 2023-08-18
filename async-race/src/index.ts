import App from './app/index';
import './global.scss';
import { PageIds } from './types/index';
const app = new App();
app.start(localStorage.getItem('page') ?? PageIds.GaragePage);
