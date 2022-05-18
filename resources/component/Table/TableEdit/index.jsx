import * as React from "react"
import "./index.module.less"

//示例：https://www.w3schools.com/howto/howto_css_switch.asp

class TableEdit extends React.Component {

    render(){
        return(
            <ul style={{ display: this.props.display }}>
                <li onClick={this.props.addRowOnTop}>上方插入行</li>
                <li onClick={this.props.addRowOnBottom}>下放插入行</li>
                <li onClick={this.props.addColLeft}>左方插入列</li>
                <li onClick={this.props.addColRight}>右方插入列</li>
                <li onClick={this.props.removeCurrentRow}>移除该行</li>
                <li onClick={this.props.removeCurrentCol}>移除该列</li>
                <li onClick={this.props.duplicateRow}>复制该行</li>
                <li onClick = {this.props.duplicateCol}>复制该列</li>
                <li onClick={this.props.clearRow}>清空该行</li>
                <li onClick={this.props.clearCol}>清空该列</li>
            </ul>
        )
    }
}

export default TableEdit;