'use strict';
const Groups = function(list) {
    this.num = 0;
    this.size = () => list.length;
    this.inc = () => ++this.num;
    this.dec = () => --this.num;
    this.get = () => list[this.num];
    this.isEmpty = list === undefined || list === null || this.size() === 0;
};

let listGroups = new Groups([]);

const regexInput = document.querySelector("#regex");
const getRegex = () => regexInput.value;

const templateInput = document.querySelector("#template");
const getTemplate = () => templateInput.value;

const isAllMatchBlock = document.querySelector("#match-block");

const errorBlock = document.querySelector("#error");
errorBlock.style.display = "none";

const resultBlock = document.querySelector("#result-block");
resultBlock.style.display = "none";

const resultInput = document.querySelector("#result");

const label = document.querySelector("#group-counter");

const send = () => {
    isAllMatchBlock.classList.remove("not-all-match");
    isAllMatchBlock.classList.remove("all-match");
    isAllMatchBlock.classList.add("wait");
    isAllMatchBlock.innerHTML = 'Waiting data';
    fetch("/parse", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            regex: getRegex(),
            template: getTemplate()
        })
    }).then(e => e.json()).then(it => {
        isAllMatchBlock.classList.remove("wait");
        if (it.allMatched) {
            isAllMatchBlock.classList.remove("not-all-match");
            isAllMatchBlock.classList.add("all-match");
            isAllMatchBlock.innerHTML = "All match";
        } else {
            isAllMatchBlock.classList.remove("all-match");
            isAllMatchBlock.classList.add("not-all-match");
            isAllMatchBlock.innerHTML = "Not all match";
        }
        if (it.error) {
            if (errorBlock.style.display === 'none')
                errorBlock.style.display = 'block';
            errorBlock.innerHTML = it.error;
        } else if (errorBlock.style.display !== 'none')
            errorBlock.style.display = 'none';
        if (it.result) {
            resultInput.style.display = "block";
            resultInput.value = it.result;
        } else {
            resultInput.style.display = "none";
        }
        listGroups = new Groups(it.result);
        if (listGroups.isEmpty) {
            resultBlock.style.display = "none";
        } else {
            resultBlock.style.display = "flex";
            resultInput.value = listGroups.get();
            label.innerHTML = listGroups.num;
        }
    });
};
const incGroup = () => {
    if (listGroups.isEmpty || listGroups.num === listGroups.size() - 1) return;
    listGroups.inc();
    resultInput.value = listGroups.get();
    label.innerHTML = listGroups.num;
};
const decGroup = () => {
    if (listGroups.isEmpty || listGroups.num === 0) return;
    listGroups.dec();
    resultInput.value = listGroups.get();
    label.innerHTML = listGroups.num;
};

document.querySelector("#send-button").onclick = send;
document.querySelector("#inc-button").onclick = incGroup;
document.querySelector("#dec-button").onclick = decGroup;