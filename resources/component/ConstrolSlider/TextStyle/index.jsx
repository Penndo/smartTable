import * as React from "react"
import ColorPicker from "../../Public/ColorPicker";
import TextInput from "../../Public/TextInput";
import styles from "./index.module.less"

//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class TextStyleSetting extends React.Component {


    state = {
        data:this.props.data,
    }
    
    //获取颜色值，并更新 data 数据
    getValue = (name,value) => {

        //获取上面的 data
        const {data} = this.state;

        //设置新的 data
        const newData = {...data,[name]: value};

        //更新 data
        this.setState({
            data: newData
        })
        //这里如果更新数据传递的是 data,那么数据将产生滞后，因为这里的data保存的是上一次操作的状态，在执行getValue时，getDetails()也会同时执行，因此传递出去的数据会是上一次操作的数据。
        // this.props.getDetails(this.props.name, data)
        this.props.getDetails(this.props.name, newData)
    }

    render(){
        return(
            <div>
                <p>{this.props.type}</p>
                <div className={styles["fontStyle"]}>
                    <div>
                        <ColorPicker style={{ width: 62, height: 24}} defaultColor={"#D8D8D8"} name="basicColor" getValue={this.getValue}/>
                        <label>颜色</label>
                    </div>
                    <TextInput style={{width:62}} label = "字号" defaultValue={14} name="fontSize"  getValue={this.getValue}/>
                    <TextInput style={{width:132}} label = "字重" defaultValue="normal" name="fontWeight"  getValue={this.getValue}/>
                </div>
            </div>
        )
    }
}

export default TextStyleSetting;