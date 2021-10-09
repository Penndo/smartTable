import * as React from "react"
import TextStyleSetting from "./TextStyle"
import TableBg from "./TableBg"
import CellPaddingSetting from "./CellPadding"
import FormInputV from "./FormInputV"
// import TableSizeSetting from "./TableSize"
import CellAmount from "./CellAmount"
import TableData from "./TableData"
import ButtonGroup from "./ButtonGroup"
import "./index.less"


export default function ConstrolSlider(props){

    const {tableWidth, tableAmount, dataFrom, padding, fill, border, textStyle} = props.controlData;
    const {getDetails,renderData,controlData} = props

    return (
        <div className="constrolSlider">

            <div className="configureArea">

                {/* <TableSizeSetting /> */}

                <FormInputV type="表格宽度" getDetails = {getDetails} data = {tableWidth}/>

                <CellAmount type="表格数量" getDetails = {getDetails} name="tableAmount" data={tableAmount} />

                <TableData type = "数据源" getDetails = {getDetails} name="dataFrom" data={dataFrom}/>
                
                <CellPaddingSetting type="padding" name="padding" data={padding} getDetails = {getDetails}/>

                <TableBg type="填充" toggleLabel="隔行换色" switchColorPicker={true} defaultColor="#FFFFFF" getDetails = {getDetails} name="fill" data={fill}/>

                <TableBg type="边框" toggleLabel="列分割线" switchColorPicker={false} defaultColor="#D8D8D8" getDetails = {getDetails} name="border" data={border}/>

                <TextStyleSetting type="文本样式" name="textStyle" data={textStyle} getDetails = {getDetails}/>

            </div>

            <div className="buttonGroup">
                    <ButtonGroup renderData={renderData} controlData={controlData}/>
            </div>

        </div>
    )
}