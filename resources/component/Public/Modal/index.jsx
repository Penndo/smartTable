import * as React from "react"
import * as IDB from "../IDB"
import styles from "./index.module.less"
import Button from "../Button"

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

function createModal(modalName,storageData,updateFunc) {
    IDB.createIDB().then((db)=>{

        if(modalName.trim() !== ""){
            IDB.getAllValue(db,defaultStoreName).then(
                function(result){
                    let isHave = 0;
                    for(let i=0;i<result.length;i++){
                        if(result[i].title === modalName){
                            isHave = 1;
                        }
                    }
                    
                    // 如果数据库中还不存在该数据。
                    if(!isHave){
                        var data = {};
                        data.title = modalName;
                        data.information = storageData;
    
                        //添加数据到数据库
                        IDB.add(db,defaultStoreName,data);
                        //更新最后选择
                        IDB.update(db,defaultHistoryName,{id:1,history:modalName});
                        updateFunc();
                        
    
                    }else{
                        alert(`已经存在 “${modalName}” 了，请重新输入`)
                    }
                }
            )
        }else{
            alert("title不能为空")
        }
    })
}

class Modal extends React.Component {

    state = {
        inputValue:"",
    }

    onchange = (e)=>{
        this.setState({
            inputValue:e.target.value,
        })
    }

    newTemplate = (modalName,storageData,func,updateFunc) => {
        const tableRows = this.props.table_ref.current.rows;
        return function() {

            //重新去获取表格的行高
            let newCellSize = {};
            let newstHeightArr = [];
            for(let i=0;i<tableRows.length;i++){
                newstHeightArr.push(tableRows[i].offsetHeight)
            };
            newCellSize.width = storageData.cellSize.width;
            newCellSize.height = newstHeightArr;
            storageData.cellSize = newCellSize
            createModal(modalName,storageData,updateFunc);
            func();
        }

    }

    render(){
        const {storageData, updateData} = this.props
        const {inputValue} = this.state;
        const btnFunc = this.props.func;
        return(
            <div className={styles["dialog"]}>
                <input type="text" value={inputValue} onChange={this.onchange} placeholder="请输入模板名"/>
                <Button label="取消" type = "secondary" func = {btnFunc}/>
                <Button label="确定" func = {this.newTemplate(inputValue,storageData,btnFunc,updateData)}/>
            </div>
        )
    }
}

export default Modal;