import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import LoadingPage from './components/loadingPage';
import IndexPage from './components/indexPage';
import {Provider, observer} from 'mobx-react';
import store from './store';
import {IPContext} from './context';
import TipComponent from './components/tipComponent';

@observer
class App extends React.Component {
    render(){
        return (
            // 192.168.0.103 192.168.0.105 10.242.116.227
            <React.Fragment>
                <IPContext.Provider value={"https://longhaha.top:3001"}>
                    <Provider {...store}>
                        <Suspense fallback={<LoadingPage />}>
                            <IndexPage />
                        </Suspense> 
                    </Provider>
                </IPContext.Provider>
                {ReactDOM.createPortal(<TipComponent tipStore = {store.TipStore}/>, document.getElementById("app"))}
                {store.TipStore.waiting && ReactDOM.createPortal(<LoadingPage ifWaiting={true}/>, document.getElementById("app"))}
            </React.Fragment>
        )
    }
}

ReactDOM.render(<App/>,document.getElementById("app"));