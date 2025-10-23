class GreetingElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerText = ":3";
    }
}

customElements.define("greeting-element", GreetingElement);
