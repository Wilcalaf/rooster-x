
import {css, LitElement, html, customElement, property} from "lit-element";
import {RoosterX} from "./RoosterX";
import {IpcService} from "../services/ipc.service";
import * as score from "string-score";

@customElement("top-bar")
export class TopBar extends LitElement {

    @property() public rooster: RoosterX;
    @property() public _fullScreen: boolean = false;
    @property() public _searchTerm: string = "";

    public createRenderRoot() {
        return this;
    }

    constructor() {
        super();
    }

    private toggleFullScreen() {
        IpcService.fullScreen();
        this._fullScreen = !this._fullScreen;
        this.rooster.setFocuseToVideos();
    }

    private toggleSideBar() {
        this.rooster._panel = "";
        this.rooster._sideBar = !this.rooster._sideBar;
        this.requestUpdate();
    }

    private search(e?: any) {
        this.rooster._filteredMedia = [...this.rooster._media];
        if (e && e.target.value) {
            const searchTerm = e.target.value;
            this.rooster._filteredMedia = this.rooster._filteredMedia.filter((v) => {
                const s = score(v.title, searchTerm, 0.5);
                // console.log(v.title + " - " + searchTerm, s);
                v.stringScore = s;
                return s > 0.3;
            });
            this._searchTerm = searchTerm;
            this.rooster._filteredMedia.sort((a, b) => {
                if (a && b && b.stringScore && a.stringScore) {
                    return b.stringScore - a.stringScore;
                }
                return 0;
            });
        } else {
            this._searchTerm = "";
        }
        this.requestUpdate();
    }

    private clearSearch() {
        const input = document.querySelector(".search input") as HTMLInputElement;
        if (input) {
            input.value = "";
            this.search();
            this.rooster.setFocuseToVideos();
            this.requestUpdate();
        }
    }

    private static close() {
        IpcService.quitApp();
    }

    public render() {
        return html`
        <div class="top-bar">
            <div>
                <div class="logo" @click="${this.toggleSideBar}"></div>
                <div class="search">
                    <input type="text" placeholder="Search..." @input="${this.search}">
                    ${this._searchTerm ? html`<i class="material-icons" @click=${this.clearSearch}>backspace</i>` : ""}
                </div>
                <div class="refresh"></div>
            </div>
            <div>
                <div class="user"></div>
                <div class="maximize" @click=${this.toggleFullScreen}>
                    <i class="material-icons">${this._fullScreen ? "fullscreen_exit" : "fullscreen"}</i>
                </div>
                <div class="close" @click=${TopBar.close}>
                    <i class="material-icons">close</i>
                </div>
            </div>
        </div>`;
    }
}