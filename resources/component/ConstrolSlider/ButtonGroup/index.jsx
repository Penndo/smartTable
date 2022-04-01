import * as React from "react"
import Button from "../../Public/Button";
import Modal from "../../Public/Modal";
import styles from './index.module.less'

class ButtonGroup extends React.Component {

    state = {
        createTemplate:false
    }

    createTemplate = ()=>{
        console.log("按钮被点击了")
        this.setState({
            createTemplate:!this.state.createTemplate
        })
    }

    //点击确定的时候传递数据
    transData = (renderHead,renderData,controlData,cellSize) => {
        return ()=>{
            postMessage('insert',renderHead,renderData,controlData,cellSize);
            // console.log(renderHead,renderData,controlData,cellSize);
        }
    }
    //点击取消的时候需要关闭窗口
    
    render(){
        const {createTemplate} = this.state;
        const {renderHead,renderData,controlData,cellSize,updateData} = this.props;

        const storageData = {
            renderHead:renderHead,
            renderData:renderData,
            controlData:controlData,
            cellSize:cellSize
        }

        return (
            <div style={{position:"relative"}}>
                {createTemplate  
                    ? <Modal updateData={updateData} storageData={storageData} func = {this.createTemplate}  />
                    :   <div className = {styles["buttonGroup"]} >
                            <Button label = "创建为模板" type = "secondary" func = {this.createTemplate}/>
                            <Button label = "生成表格" func={this.transData(renderHead,renderData,controlData,cellSize)}/>
                        </div>
                }
                
                

                
            </div>
        )
    }
}

export default ButtonGroup;