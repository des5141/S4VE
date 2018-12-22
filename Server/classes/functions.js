function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function Stack() {
    this.dataStore = [];
    this.top = -1;
    this.push = push;
    this.pop = pop;
    this.peek = peek;
    this.clear = clear;
    this.length = length;
}

function push(element) {
    this.top = this.top + 1;
    this.dataStore[this.top] = element;
}

function peek() {
    return this.dataStore[this.top];
}

function pop() {
    if (this.top <= -1) {
        console.log("Stack underflow!!!");
        return;
    } else {
        var popped = this.dataStore[this.top];
        this.top = this.top - 1;
        return popped;
    }

}

function clear() {
    this.top = -1;
}

function length() {
    return this.top + 1;
}