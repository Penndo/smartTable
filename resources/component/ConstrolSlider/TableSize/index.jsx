import * as React from "react"
import styles from "./index.module.less"

//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class TableSizeSetting extends React.Component {
    render(){
        return(
            <div>
                <p>表格尺寸</p>
                <div className={styles["radio"]}>
                
                    <input type="radio" id="big" className={styles["big"]} name="drone" value="big" defaultChecked={true}/>
                    <label htmlFor="big">大</label>
            
                    <input type="radio" id="normal" className={styles["normal"]} name="drone" value="normal" defaultChecked={false} />
                    <label htmlFor="normal">中</label>
            
                    <input type="radio" id="small" className={styles["small"]} name="drone" value="small" defaultChecked={false}/>
                    <label htmlFor="small">小</label>
          
                    <div className={styles["selectedBg"]}></div>  
                </div>
            
            </div>
        )
    }
}

export default TableSizeSetting;