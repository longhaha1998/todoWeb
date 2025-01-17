import {observable, action, runInAction} from "mobx";

class TipStore{
    @observable tipData;
    @observable success;
    @observable fail;
    @observable warning;
    @observable waiting;

    constructor(){
        this.tipData = "";
        this.success = false;
        this.fail = false;
        this.warning = false;
        this.waiting = false;
    }

    @action
    changeData(val, type){
        this.tipData = val;
        this[type] = true;
        setTimeout(() => {
            runInAction(() => {
                this.tipData = "";
                this.success = false;
                this.fail = false;
                this.warning = false;
            })
        },1000);
    }

    @action
    toggleWaiting(){
        this.waiting = !this.waiting;
    }
}

let tipStore = new TipStore();

export default tipStore;