import React from "react";
import './index.scss';
import {inject, observer} from 'mobx-react';
import axios from 'axios';
import {IPContext} from '../../context';

@inject('NewListStore','TipStore')
@observer
class NewToDoPage extends React.Component{

    static contextType = IPContext;

    constructor(props){
        super(props);
        this.state = {
            status: 0,
            ifConnectDB: false,
        }
        this.handleAddItem = this.handleAddItem.bind(this);
        this.getList = this.getList.bind(this);
        this.handleEditItem = this.handleEditItem.bind(this);
        this.finishedEdit = this.finishedEdit.bind(this);
        this.handleToogleStatus = this.handleToogleStatus.bind(this);
        this.matchStatus = this.matchStatus.bind(this);
        this.handleClearCompleted = this.handleClearCompleted.bind(this);
        this.handlePostEvent = this.handlePostEvent.bind(this);
        this.handleDBStatus = this.handleDBStatus.bind(this);
        this.handleToogleItem = this.handleToogleItem.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    handlePostEvent(addr,body,method,action){
        const {TipStore: tipStore} = this.props;
        if(this.state.ifConnectDB){
            tipStore.toggleWaiting();
            axios({
                url: addr,
                data: body,
                method: method
            }).then(res => {
                tipStore.waiting && tipStore.toggleWaiting();
                if(res.data.status === 1){
                    tipStore.changeData(res.data.msg,'success');
                }else{
                    tipStore.changeData(res.data.msg,'fail');
                }
            }).catch(err => {
                tipStore.waiting && tipStore.toggleWaiting();
                console.log(err);
                tipStore.changeData(`${action}失败`,'fail');
            });
            return;
        }
        tipStore.changeData(`${action}成功`,'success');
    }

    handleAddItem(e){
        const {NewListStore: newListStore, TipStore: tipStore} = this.props;
        if(e.keyCode === 13 && e.target.value !== ""){
            const newItem = newListStore.addTodoItem(e.target.value);
            newListStore.updateCurrentVal("");
            this.handlePostEvent(this.context+'/addItem',newItem,'post','添加');
        }
    }

    handleEditItem(e, id){
        const {NewListStore: newListStore} = this.props;
        if(newListStore.newTodoList.length>0){
            document.getElementById(id).classList.add('editing');
            document.querySelector(`#${id} .edit`).focus();
        }
    }

    finishedEdit(e, id, isKeyDown){
        const {NewListStore: newListStore, TipStore: tipStore} = this.props;
        const item = {
            id: id.slice(2),
            val: e.target.value
        }
        if(isKeyDown){
            if(e.keyCode === 13){
                document.getElementById(id).classList.remove('editing');
                this.handlePostEvent(this.context+'/updateItemById',item,'put','修改');
            }
            return;
        }
        if(newListStore.newTodoList.length>0){
            document.getElementById(id).classList.remove('editing');
            this.handlePostEvent(this.context+'/updateItemById',item,'put','修改');
        }
    }

    handleToogleStatus(e, val){
        e.preventDefault();
        this.setState({
            status: val
        });
    }

    matchStatus(ifFinished){
        const status = this.state.status;
        if(ifFinished){
            if(status === 1){
                return 'hide'
            }else{
                return ''
            }
        }else{
            if(status === 2){
                return 'hide'
            }else{
                return ''
            }
        }
    }

    handleClearCompleted(e){
        const {NewListStore: newListStore, TipStore:tipStore} = this.props;
        e.preventDefault();
        newListStore.clearCompleted();
        if(this.state.ifConnectDB){
            tipStore.toggleWaiting()
            axios.delete(this.context+'/clearCompleted').then(res => {
                tipStore.waiting && tipStore.toggleWaiting();
                if(res.data.status === 1){
                    tipStore.changeData(res.data.msg,'success')
                }else{
                    tipStore.changeData(res.data.msg,'fail')
                }
            }).catch(err => {
                tipStore.waiting && tipStore.toggleWaiting();
                console.log(err)
                tipStore.changeData('清除失败','fail')
            })
            return;
        }
        tipStore.changeData("清除成功","success");
    }

    handleToogleItem(e, item){
        const {NewListStore: newListStore} = this.props;
        newListStore.toogleItem(item);
        if(this.state.ifConnectDB){
            axios.put(this.context+'/toogleItem',{id:item.id,finished:item.finished}).then().catch(err => {
                console.log(err);
            })
        }
    }

    handleDeleteItem(e, item){
        const {NewListStore: newListStore, TipStore:tipStore} = this.props;
        newListStore.deleteItem(item);
        if(this.state.ifConnectDB){
            tipStore.toggleWaiting()
            axios.delete(this.context+`/deleteItemById?id=${item.id}`).then(res => {
                tipStore.waiting && tipStore.toggleWaiting();
                if(res.data.status === 1){
                    tipStore.changeData(res.data.msg,'success')
                }else{
                    tipStore.changeData(res.data.msg,'fail')
                }
            }).catch(err => {
                tipStore.waiting && tipStore.toggleWaiting();
                console.log(err)
                tipStore.changeData('删除失败','fail')
            })
            return;
        }
        tipStore.changeData("删除成功","success");
    }

    getList(){
        const {NewListStore: newListStore} = this.props;
        return newListStore.newTodoList.map((item,index) => (
            <li className={this.matchStatus(item.finished)} id={`li${item.id}`} key={`${item.id}`}>
                <div className='listView'>
                    <input onChange={(e) => {this.handleToogleItem(e, item)}} className="toogle" type="checkbox" checked={newListStore.finishedItem.includes(item.id)}></input>
                    <label className={(newListStore.ifSearch && item.val.indexOf(newListStore.searchVal)>-1)?'searchItem':''} onDoubleClick={(e) => {this.handleEditItem(e, `li${item.id}`)}}>{item.val}</label>
                    <button onClick={(e) => {this.handleDeleteItem(e, item)}} className='destroy'></button>
                </div>
                <input onKeyDown={(e) => {this.finishedEdit(e, `li${item.id}`, true)}} onBlur={(e) => {this.finishedEdit(e, `li${item.id}`)}} value={item.val} onChange={e => {newListStore.editItem(item.id, e.target.value)}} type="text" className="edit"/>
            </li>
        ))
    }

    handleDBStatus(e, status){
        const {NewListStore: newListStore, TipStore: tipStore} = this.props;
        e.preventDefault();
        switch(status){
            case 0:
                this.setState({
                    ifConnectDB: !this.state.ifConnectDB
                })
                break;
            case 1:
                tipStore.toggleWaiting()
                axios.post(this.context+'/pushAllItem',{data:newListStore.newTodoList.slice(0)}).then(res => {
                    tipStore.waiting && tipStore.toggleWaiting();
                    if(res.data.status === 1){
                        tipStore.changeData(res.data.msg,'success')
                    }else{
                        tipStore.changeData(res.data.msg,'fail')
                    }
                }).catch(err => {
                    tipStore.waiting && tipStore.toggleWaiting();
                    console.log(err)
                    tipStore.changeData('推送失败','fail')
                })
                break;
            case 2:
                tipStore.toggleWaiting()
                axios.get(this.context+'/getAllItem').then(res => {
                    tipStore.waiting && tipStore.toggleWaiting();
                    if(res.data.status === 1){
                        newListStore.pullDataFromDB(res.data.data)
                        tipStore.changeData(res.data.msg,'success')
                    }else{
                        tipStore.changeData(res.data.msg,'fail')
                    }
                }).catch(err => {
                    tipStore.waiting && tipStore.toggleWaiting();
                    console.log(err)
                    tipStore.changeData('拉取失败','fail')
                })
                break;
            default:
                break;
        }
    }

    handleSearch(e, isKeyDown){
        const {NewListStore: newListStore, TipStore: tipStore} = this.props;
        if(isKeyDown){
            if(e.keyCode === 13 && newListStore.searchVal !== ''){
                newListStore.handleSearch();
            }
            return;
        }
        if(newListStore.searchVal !== ''){
            newListStore.handleSearch();
        }
    }

    render(){
        const {NewListStore: newListStore} = this.props;
        return(
            <div id="newTodoDom">
                <h1>todos</h1>
                <div id='btnContainer'>
                    <a className="dbBtn" onClick={(e) => this.handleDBStatus(e, 0)}>{this.state.ifConnectDB?'取消关联数据库':'关联数据库'}</a>
                    <a className="dbBtn" onClick={(e) => this.handleDBStatus(e, 1)}>推送至数据库</a>
                    <a className="dbBtn" onClick={(e) => this.handleDBStatus(e, 2)}>从数据库拉取</a>
                </div>
                <div id='searchDom'>
                    <input onBlur={(e) => {newListStore.cancelSearch()}} onKeyDown={e => {this.handleSearch(e, true)}} placeholder='搜索' id='search' value={newListStore.searchVal} onChange={(e) => {newListStore.ifSearch && newListStore.cancelSearch();newListStore.updateSearchVal(e.target.value)}}></input>
                    <label for='search' onClick={e => {this.handleSearch(e)}} id='searchImg'/>
                </div>
                <div id="newListDom">
                    <input onChange={(e) => {newListStore.toogleAll()}} id="toogle-all" className="toogle-all" type="checkbox" checked={newListStore.allFinished}></input>
                    {newListStore.newTodoList.length>0 && <label id="toogleAllLabel" for="toogle-all">{`>`}</label>}
                    <input value={newListStore.currentVal} onKeyDown={e => {this.handleAddItem(e)}} onChange={e => {newListStore.updateCurrentVal(e.target.value)}} className="new-todo-input" placeholder="What needs to be done?"></input>
                </div>
                <ul>
                    {newListStore.newTodoList.length>0 && this.getList()}
                </ul>
                {
                    newListStore.newTodoList.length>0
                    &&
                    <footer id="listFooter">
                            <div id="footerLeft">
                                {`${newListStore.unfinishedItem.length} items left`}
                            </div>
                            <div id="footerMid">
                                <a onClick={(e) => this.handleToogleStatus(e, 0)} className={this.state.status === 0?'nowStatus':''}>All</a>
                                <a onClick={(e) => this.handleToogleStatus(e, 1)} className={this.state.status === 1?'nowStatus':''}>Active</a>
                                <a onClick={(e) => this.handleToogleStatus(e, 2)} className={this.state.status === 2?'nowStatus':''}>Completed</a>
                            </div>
                            <div id="footerRight">
                                <a onClick={(e) => this.handleClearCompleted(e)}>Clear completed</a>
                            </div>
                    </footer>
                }
            </div>
        )
    }
}

export default NewToDoPage;