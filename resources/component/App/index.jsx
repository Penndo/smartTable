import * as React from "react";
import { useState } from "react";
import {v4 as uuidv4} from "uuid";

import {createIDB, getAllValue,getValue} from "../Public/IDB";
import { shearData,recalculate_CellSize } from "../Public/Tools";

import Table from "../Table";
import ConstrolSlider from "../ConstrolSlider";

import styles from "./index.module.less";

const defaultStoreName = "defaultStore";
const defaultHistoryName = "historyStore";

const originControlData = {
    tableWidth:"640",
    tableAmount:{
        cols:"4",
        rows:"4"
    },
    dataFrom:{
        api:"https://randomuser.me/api/?results=5&inc=",
        parameter:"gender,email,nat,phone"
    },
    tbodyPadding:{
        b_top:"12",
        b_right:"16",
        b_bottom:"12",
        b_left:"16"
    },
    theadPadding:{
        h_top:"12",
        h_bottom:"12"
    },
    fill:{
        basicColor:"#FFFFFF",
        switchState:false,
        intervalColor:""
    },
    border:{
        basicColor:"#EDEDED",
        switchState:true,
        intervalColor:"#EDEDED"
    },
    theadFill:{
        basicColor:"#FFFFFF"
    },
    textStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    },
    theadTextStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    }
}

const originCellSize = {
    height:[40,40,40,40,40],
    width:[160,160,160,160]
}

//初始表头数据及格式
const originHead = [
    {serialNumber:"0",colID:1,title:"A",key:uuidv4()},
    {serialNumber:"1",colID:2,title:"B",key:uuidv4()},
    {serialNumber:"2",colID:3,title:"C",key:uuidv4()},
    {serialNumber:"3",colID:4,title:"D",key:uuidv4()}
]

//初始表格数据及格式
const originData = [
    {rowID:1,1:"表",2:"",3:"",4:"",key:uuidv4()},
    {rowID:2,1:"格",2:"",3:"",4:"",key:uuidv4()},
    {rowID:3,1:"工",2:"",3:"",4:"",key:uuidv4()},
    {rowID:4,1:"具",2:"",3:"",4:"",key:uuidv4()}
]

//从模板更新页面数据
function refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize,setDynamicHead,setDynamicData) {
    createIDB().then((db)=>{
        getAllValue(db,defaultHistoryName).then((result)=>{
            if(!result.length) return false;
            const indexValue = result[0].history;
            getValue(db,defaultStoreName,"title",indexValue).then((result)=>{
                const data = result.information;
                //更新 controlData 就可以驱动页面重新计算，进而得到最新的 renderData, renderHead
                setControlData(data.controlData);
                setDynamicData(data.renderData);
                setRenderData(data.renderData);
                setDynamicHead(data.renderHead);
                setRenderHead(data.renderHead);
                setCellSize(data.cellSize)
            });
        });
    })
}

export default function App(){

    //初始数据
    const [dynamicHead, setDynamicHead] = useState(originHead);
    const [dynamicData, setDynamicData] = useState(originData);
    const [controlData, setControlData] = useState(originControlData);

    //单元格尺寸
    const [cellSize, setCellSize] = useState(originCellSize);
    const [headerIndependentStyle, setHeaderIndependentStyle] = useState(false);
    const getCellSize = React.useCallback(
        (data)=>{
            setCellSize(data);
        },[]
    )

    //传递设置动态数据的函数给 Table。
    const set_dynamic_data = React.useCallback((data)=>{
        setDynamicData(data)
    },[])
    const set_dynamic_head = React.useCallback((data)=>{
        setDynamicHead(data)
    },[])

    //表头独立样式启用
    function syncBodyStyleToHeader() {
        setHeaderIndependentStyle(true)
    }

    //更新样式表
    const getControlData = React.useCallback(

        (name,data)=>{

            //用来判断表头样式和表格样式是否全等。如果不全等就让样式独立编辑。
            const headerIndependentStyle_condition = 
                controlData.tbodyPadding.b_top !== controlData.theadPadding.h_top || 
                controlData.tbodyPadding.b_bottom !== controlData.theadPadding.h_bottom ||
                controlData.fill.basicColor !== controlData.theadFill.basicColor ||
                controlData.textStyle.basicColor !== controlData.theadTextStyle.basicColor ||
                controlData.textStyle.fontSize !== controlData.theadTextStyle.fontSize ||
                controlData.textStyle.fontWeight !== controlData.theadTextStyle.fontWeight;

            let lastHeaderIndependentStyle = headerIndependentStyle;

            if(headerIndependentStyle_condition){
                lastHeaderIndependentStyle = true;
            }

            //同步表格样式数据至表头
            function syncControlData() {
                let syncData = {}
                if(!lastHeaderIndependentStyle){              
                    if(name === "tbodyPadding"){
                            syncData = {theadPadding:{
                                h_top:data.b_top,
                                h_bottom:data.b_bottom
                            }
                        }
                    }else if(name === "fill"){
                            syncData = {theadFill:{
                                basicColor:data.basicColor
                            }
                        }
                    }else if(name === "textStyle"){
                            syncData = {theadTextStyle:{
                                basicColor:data.basicColor,
                                fontSize:data.fontSize,
                                fontWeight:data.fontWeight
                            }
                        }
                    };
                }
                return {...syncData,[name]:data}
            }

            setControlData({
                ...controlData,...syncControlData()
            })

        },[controlData,headerIndependentStyle]
    )

    const [colID, setColID] = useState(maxID(dynamicHead,"colID"))
    const [rowID, setRowID] = useState(maxID(dynamicData,"rowID"))

    function maxID(data,name){
        let IDArr = [];
        for(let i=0;i<data.length;i++){
            IDArr.push(data[i][name])
        };
        return Math.max(...IDArr)
    }

    const getColID = React.useCallback((colID)=>{
        setColID(colID)
    },[])

    const getRowID = React.useCallback((rowID)=>{
        setRowID(rowID)
    },[])

    //表格数量更新，更新动态数据 dynamicData,以及各列的宽度
    function changeCols(count) {
        //更新表格数据
        let shearedHead = shearData(count,dynamicHead,colID,"colID",getColID)
        if(shearedHead.length > dynamicHead.length){ //当更新后的数据长度大于原有的数据长度时，将这个更长的数据设置为 dynamicData,否则不做处理。因为只是对原有的 dynamicData 进行裁切，不会生成新的单元格。对最终数据呈现 renderData 没有影响
            setDynamicHead(shearedHead)
        }

        //更新列宽度
        const tableWidth = controlData.tableWidth;
        const width = 160;
        const cellArr = cellSize.width;
        const oldCellAmount = cellArr.length; //获取原有的数组长度
        const changeAmount = count - oldCellAmount; //获取长度改变量，>0 是增加列，<0 是减少列。

        let newCellArr=[];//先定义一个新数组。

        //如果是增加列
        if(changeAmount > 0){
            const increasedCellArr = new Array(changeAmount).fill(width);//要添加的数组
            newCellArr = cellArr.concat(increasedCellArr);//添加了新增数组后的新数组。
        }else{ //如果是减少列
            newCellArr = cellArr.slice(0,count);//重新拷贝一份cols长度的数组
        }
        
        //recalculate_CellSize 函数会重新处理表格宽度
        let newCellSize = recalculate_CellSize(newCellArr,tableWidth)
        getCellSize({...cellSize,...newCellSize});
    }

    function changeRows(count) {
        let shearedData = shearData(count,dynamicData,rowID,"rowID",getRowID)
        if(shearedData.length > dynamicData.length){
            setDynamicData(shearedData)
        }
    }
    
    const [renderData, setRenderData] = useState([]);
    const [renderHead, setRenderHead] = useState([]);

    //页面加载时，加载一次本地存储的数据
    React.useEffect(()=>{
        refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize,setDynamicHead,setDynamicData);
    },[])

    const getRenderData = React.useCallback(
        (data) => {
            setRenderData(data);
        },[]
    )

    const getRenderHead = React.useCallback(
        (data) => {
            setRenderHead(data)
        },[]
    )

    //切换模板更新初始数据
    function switchTemplate(){
        refreshDataFromComponent(setControlData,setRenderData,setRenderHead,setCellSize,setDynamicHead,setDynamicData)
    }

    function backToInitialState(){
        setCellSize(originCellSize);
        setControlData(originControlData);
        setRenderHead(originHead);
        setRenderData(originData);
        setDynamicHead(originHead);
        setDynamicData(originData);
    }

    return (
        <div className={styles["container"]}>
            <Table 
                colID={colID}
                rowID={rowID}
                getColID={getColID}
                getRowID={getRowID}
                dynamicData={dynamicData}
                dynamicHead={dynamicHead}
                setDynamicHead={set_dynamic_head}
                setDynamicData={set_dynamic_data}
                controlData={controlData} 
                getControlData={getControlData} 
                getRenderData={getRenderData} 
                getRenderHead={getRenderHead}
                cellSize={cellSize}
                getCellSize={getCellSize}
            />

            <ConstrolSlider 
                changeCols={changeCols}
                changeRows={changeRows}
                switchTemplate = {switchTemplate}
                backToInitialState = {backToInitialState}
                syncBodyStyleToHeader={syncBodyStyleToHeader}
                cellSize={cellSize}
                controlData={controlData} 
                getControlData={getControlData} 
                renderData={renderData}
                renderHead={renderHead}
            />
        </div>
    )
}