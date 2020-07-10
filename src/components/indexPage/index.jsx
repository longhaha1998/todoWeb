import React, {Suspense} from "react";
import './index.scss';
import LoadingPage from '../loadingPage'
import NewToDoPage from '../newTodo'

class IndexPage extends React.Component{

    constructor(props){
        super(props);
    }
    
    render(){
        return(
            <div id="idnexDom">
                <Suspense fallback={<LoadingPage />}>
                    <NewToDoPage />
                </Suspense>
            </div>
        )
    }
}

export default IndexPage;