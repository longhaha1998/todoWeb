import {observable, action, computed} from 'mobx'

class NewListStore {
    @observable currentVal;
    @observable newTodoList;
    @observable unfinishedItem;
    @observable finishedItem;
    @observable searchVal;
    @observable ifSearch;

    constructor(){
        this.currentVal = '';
        this.newTodoList = [];
        this.unfinishedItem = [];
        this.finishedItem = [];
        this.searchVal = '';
        this.ifSearch = false;
    }

    @computed get allFinished(){
        return this.newTodoList.every((item) => {
            return item.finished;
        })
    }

    @action
    updateCurrentVal(val){
        this.currentVal = val;
    }

    @action
    addTodoItem(item){
        let id = new Date().getTime();
        id += (Array(3).join(0) + Math.random()*100).slice(-3)
        this.newTodoList.push({
            id: id,
            val: item,
            finished: false
        });
        this.unfinishedItem.push(id);
        return {
            id: id,
            val: item,
            finished: false
        }
    }

    @action
    pullDataFromDB(arr){
        this.newTodoList.splice(0,this.newTodoList.length);
        this.finishedItem.splice(0,this.finishedItem.length);
        this.unfinishedItem.splice(0,this.unfinishedItem.length);
        arr.forEach(item => {
            this.newTodoList.push({
                id: item._id,
                val: item.value,
                finished: item.finished
            })
            if(item.finished){
                this.finishedItem.push(item._id);
            }else{
                this.unfinishedItem.push(item._id);
            }
        });
    }

    @action
    toogleItem(val){
        let index = this.newTodoList.findIndex((item) => {
            return item.id === val.id
        })
        this.newTodoList[index].finished = !this.newTodoList[index].finished;
        if(this.finishedItem.includes(val.id)){
            this.finishedItem.splice(this.finishedItem.indexOf(val.id),1);
            this.unfinishedItem.push(val.id);
        }else{
            this.unfinishedItem.splice(this.unfinishedItem.indexOf(val.id),1);
            this.finishedItem.push(val.id);
        }
    }

    @action
    editItem(id, val){
        let index = this.newTodoList.findIndex((item) => {
            return item.id === id
        })
        this.newTodoList[index].val = val;
    }

    @action
    clearCompleted(){
        this.newTodoList = this.newTodoList.filter((item) => {
            return !item.finished;
        });
        this.finishedItem = [];
    }

    @action
    deleteItem(val){
        let index = this.newTodoList.findIndex((item) => {
            return item.id === val.id
        })
        this.newTodoList.splice(index,1);
        if(val.finished){
            this.finishedItem.splice(this.finishedItem.indexOf(val.id), 1);
        }else{
            this.unfinishedItem.splice(this.unfinishedItem.indexOf(val.id),1)
        }
    }

    @action
    toogleAll(){
        let ifFinished = this.newTodoList.every((item) => {
            return item.finished;
        })
        if(ifFinished){
            this.finishedItem = [];
            this.unfinishedItem = [];
            this.newTodoList.forEach(ele => {
                ele.finished = false;
                this.unfinishedItem.push(ele.id)
            });
        }else{
            this.finishedItem = [];
            this.unfinishedItem = [];
            this.newTodoList.forEach(ele => {
                ele.finished = true;
                this.finishedItem.push(ele.id)
            });   
        }
    }

    @action
    updateSearchVal(val){
        this.searchVal = val;
    }

    @action
    handleSearch(){
        this.ifSearch = true;
    }

    @action
    cancelSearch(){
        this.ifSearch = false;
    }

    @action
    addUnfinishedItem(item){
        this.unfinishedItem.push(item);
    }

    @action
    addFinishedItem(item){
        this.finishedItem.push(item);
    }
}

const newListStore = new NewListStore();

export default newListStore;