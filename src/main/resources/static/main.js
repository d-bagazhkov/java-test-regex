'use strict';
const root = document.querySelector('#root');

const jsonPost = {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    }
};

const show = (className, display) =>
    [...root.children].forEach(it => it.classList.contains(className)
        ? it.style.display = display ? display : 'flex'
        : it.style.display = 'none');

const RegexPage = function () {
    this.show = () => show('regex-page');

    const Groups = function (list) {
        this.num = 0;
        this.size = () => list.length;
        this.inc = () => ++this.num;
        this.dec = () => --this.num;
        this.get = () => list[this.num];
        this.isEmpty = list === undefined || list === null || this.size() === 0;
    };
    this.listGroups = new Groups([]);

    this.regexInput = document.querySelector("#regex-page-regex-input");
    let editor = CodeMirror(this.regexInput, {mode: 'regex'});
    this.templateInput = document.querySelector("#regex-page-template-input");
    this.infoBlock = document.querySelector("#regex-page-info-block");
    this.resultBlock = document.querySelector("#regex-page-result-block");
    this.resultInput = document.querySelector("#regex-page-result");
    this.counterLabel = document.querySelector("#regex-page-group-counter");
    this.sendButton = document.querySelector("#regex-page-send");
    this.incButton = document.querySelector("#regex-page-inc-button");
    this.decButton = document.querySelector("#regex-page-dec-button");

    const getRegex = () => this.regexInput.innerHTML;
    this.resultBlock.style.display = "none";
    const send = () => {
        console.log('send', getRegex(), this.templateInput.value);
        this.infoBlock.classList.remove("fail");
        this.infoBlock.classList.remove("done");
        this.infoBlock.classList.add("wait");
        this.infoBlock.innerHTML = 'Waiting data';
        fetch("/parse", {
            ...jsonPost,
            body: JSON.stringify({
                regex: getRegex(),
                template: this.templateInput.value
            })
        }).then(e => e.json()).then(it => {
            if (it.error) {
                this.infoBlock.classList.remove("done");
                this.infoBlock.classList.add("fail");
                this.resultBlock.style.display = "none";
                this.infoBlock.innerHTML = it.error;
                return;
            }
            if (it.allMatched) {
                this.infoBlock.classList.remove("fail");
                this.infoBlock.classList.add("done");
                this.infoBlock.innerHTML = "All match";
            } else {
                this.infoBlock.classList.remove("done");
                this.infoBlock.classList.add("fail");
                this.resultBlock.style.display = "none";
                this.infoBlock.innerHTML = "Not all match";
            }
            this.listGroups = new Groups(it.result);
            if (this.listGroups.isEmpty) {
                this.resultBlock.style.display = "none";
            } else {
                this.resultBlock.style.display = "flex";
                this.resultInput.value = this.listGroups.get();
                this.counterLabel.innerHTML = this.listGroups.num;
            }
        });
    };
    const incGroup = () => {
        if (this.listGroups.isEmpty || this.listGroups.num === this.listGroups.size() - 1) return;
        this.listGroups.inc();
        this.resultInput.value = this.listGroups.get();
        this.counterLabel.innerHTML = this.listGroups.num;
    };
    const decGroup = () => {
        if (this.listGroups.isEmpty || this.listGroups.num === 0) return;
        this.listGroups.dec();
        this.resultInput.value = this.listGroups.get();
        this.counterLabel.innerHTML = this.listGroups.num;
    };
    this.incButton.onclick = incGroup;
    this.decButton.onclick = decGroup;
    this.sendButton.onclick = send;
};

new RegexPage();

const JinjaPage = function () {
    this.show = () => show('jinja-page');
    let contextElemCounter = 1;
    this.template = document.querySelector('#jinja-page-template-input');
    this.contextBlock = document.querySelector('#jinja-page-context-block');
    this.sendButton = document.querySelector('#jinja-page-send');
    this.result = document.querySelector('#jinja-page-result');
    const getContextMap = () => {
        let contextList = [...this.contextBlock.children].map(e => {
            let key, isArray, value;
            [...e.children].forEach(f => {
                switch (true) {
                    case f.classList.contains('key'):
                        key = f.value;
                        break;
                    case f.classList.contains('is-array'):
                        isArray = f.checked;
                        break;
                    case f.classList.contains('value'):
                        value = f.value;
                        break;
                }
            });
            if (key) {
                let res = {};
                res[key] = {
                    content: value,
                    isArray
                };
                return res;
            }
        });
        let context = {};
        contextList.forEach(e => {
            for (let k in e) {
                context[k] = e[k];
            }
        });
        return context;

    };
    const createNewElem = () => {
        const elem = document.createElement('div');
        elem.classList.add('context-elem');
        const keyInput = document.createElement('input');
        keyInput.placeholder = 'Key';
        keyInput.classList.add('key', 'field');
        elem.append(keyInput);
        const label = document.createElement('label');
        label.innerHTML = 'isArray';
        elem.append(label);
        const isArrayInput = document.createElement('input');
        isArrayInput.classList.add('is-array');
        isArrayInput.type = 'checkbox';
        elem.append(isArrayInput);
        const valueInput = document.createElement('textarea');
        valueInput.placeholder = 'Value';
        valueInput.classList.add('value', 'field');
        valueInput.rows = 1;
        elem.append(valueInput);
        const addButton = document.createElement('a');
        addButton.innerHTML = '+';
        addButton.dataset.actionButton = true;
        addButton.classList.add('action-button', 'abutton');
        elem.append(addButton);
        return elem;
    };
    const remove = (id) => this.contextBlock.removeChild(this.contextBlock.querySelector('[data-id="' + id + '"]'));
    const add = () => {
        let elem = createNewElem();
        elem.dataset.id = ++contextElemCounter + "";
        this.contextBlock.append(elem);
        [...this.contextBlock.children]
            .forEach(e => [...e.children]
                .filter(f => f.classList.contains('abutton'))
                .forEach(f => {
                    f.innerHTML = '-';
                    return f.onclick = () => remove(e.dataset.id);
                })
            );
        elem.querySelector('[data-action-button]').innerHTML = '+';
        elem.querySelector('[data-action-button]').onclick = add;
    };
    this.contextBlock.querySelector('[data-id="1"]').querySelector('[data-action-button]').onclick = add;
    const send = () => {
        const body = JSON.stringify({
            template: this.template.value,
            context: getContextMap()
        });
        console.log("send", body);
        fetch("compile", {
            ...jsonPost,
            body
        }).then(e => console.log(e) || e.json()).then(it => {
            console.log('receive', it);
            this.result.value = it.result
        });
    };
    this.sendButton.onclick = send;
};


const pages = {
    'regex-page': new RegexPage(),
    'jinja-page': new JinjaPage(),
};

show('regex-page');

[...document.querySelector('nav.nav').children].forEach(e => {
    e.onclick = pages[e.dataset.href].show
});