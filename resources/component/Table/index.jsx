import * as React from "react"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import TableEdit from "./TableEdit"

import "./index.module.less"

//同步行&列数据，更新过来的新数据与上一次的数据进行更新交换，数组长度只增加不减少
function sync(preData,newData){
    for(let i=0;i<preData.length;i++){
        preData.splice(i,1,{});
    }
    //在之前删除的位置重新写入 newData 内容。
    for(let i=0;i<newData.length;i++){
        preData.splice(i,1,newData[i]);
    }
}

 //裁切数据
 function shearData(count,data){
     if(count < data.length){
         return data.slice(0,count)
     }else{
         let newly = [];
         let newlyLength = count-data.length;
         for(let i=0;i<newlyLength;i++){
             let newlyItem = {};
            newlyItem.key = uuidv4();
             newly.push(newlyItem);
        }
        return data.concat(newly);
    }
}

export default function Table(props) {

    //获取行、列数
    const {cols,rows} = props.controlData.tableAmount;

    //获取数据源、参数
    const api = props.controlData.dataFrom.api;
    const apiParameter = props.controlData.dataFrom.parameter;

    //用来控制右键菜单是否可见的状态
    const [visable, setVisable] = useState("none")
    
    //获取当前右键点击的 td 或 tr 位置
    const [tdIndex, setTdIndex] = useState(null)
    const [trIndex, setTrIndex] = useState(null)

    const rightPanel = useRef(null)
    const tbody = useRef(null)

    const getRenderData = props.getRenderData

    //初始表头数据及格式
    const originHead = [
        {title:"gender",key:uuidv4()},
        {title:"email",key:uuidv4()},
        {title:"nat",key:uuidv4()},
        {title:"phone",key:uuidv4()}
    ]
    
    //初始表格数据及格式
    const originData = [
        {"gender":"表","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
        {"gender":"格","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
        {"gender":"工","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
        {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()},
        {"gender":"具","email":"zcool.com","nat":"bilibili.com","phone":"artstation.com",key:uuidv4()}
    ]

    //动态数据
    const [dynamicHead,setDynamicHead] = useState(originHead);
    const [dynamicData, setDynamicData] = useState(originData);

    //渲染数据
    const [renderHead, setRenderHead] = useState([]);
    const [renderData, setRenderData] = useState([]);

    React.useEffect(() => {
        //将表头数据整合为对象，并加入 key
        let addKeyHead = [];
        let parameter = apiParameter.split(",");
        for(let i=0;i<parameter.length;i++){
            let headItem = {};
            headItem.title = parameter[i];
            headItem.key = uuidv4();
            addKeyHead.push(headItem);
        }
        setDynamicHead(addKeyHead);

        //fetch请求成功后更新 dynamicData
        fetch(api+apiParameter)
        .then((response) => response.json())
        .then((json) => {
            setDynamicData(
                //为原始数据加上 key
                function (){
                    let addKeyData = json.results.slice()
                    for(let i=0;i<addKeyData.length;i++){
                        addKeyData[i]["key"] = uuidv4();
                    }
                    return addKeyData;
                }
            );
        });
    },[api,apiParameter])
    
    // cols, row, dynamicHead, dynamicData 更新驱动着页面的更新
    React.useEffect(()=>{
        
        let longestData = dynamicData.slice();
        let longestHead = dynamicHead.slice();

        sync(longestHead,dynamicHead);
        sync(longestData,dynamicData);

        let readyRenderHead = shearData(cols,longestHead);
        let readyRenderData = shearData(rows,longestData);

        //处理 readyRenderHead 中的 title，使其不能为空，而是对应的列数
        for(let i=0;i<readyRenderHead.length;i++){
            if(typeof readyRenderHead[i]["title"] === "number" || readyRenderHead[i]["title"] === "" || readyRenderHead[i]["title"] === undefined){
                readyRenderHead[i]["title"] = i;
            }
        }

        // 整合数据，新建一个空数据容器
        let mergedData = [];

        //填充并合并数据
        for(let i=0;i<readyRenderData.length;i++){
            let row = {};
            //根据列数来循环，以此确定将要往 row 这个空对象中添加多少个 key:value
            for(let j=0;j<readyRenderHead.length;j++){
                row[readyRenderHead[j]["title"]] = "";
            }
            //用原有数据去覆盖生成的新数据。
            Object.assign(row, readyRenderData[i]);
            //将对象放入 mergedData 中
            mergedData.push(row);
        } 
        
        // console.log(mergedData)
        setRenderHead(readyRenderHead)
        setRenderData(mergedData)
        getRenderData(mergedData)

    },[cols,rows,dynamicHead,dynamicData,getRenderData])





    //获取当前事件的位置
    function eventPosition(e) {
        //获取点击的td
        let currentTd = e.target.tagName === "TD" ? e.target : e.target.parentNode;
        //获取点击的tr
        let currentTr = e.target.tagName === "TD" ? e.target.parentNode : e.target.parentNode.parentNode;
        //获取所有的tds
        let tds = currentTr.childNodes
        //获取所有的trs
        let trs = currentTr.parentNode.childNodes
        //获取当前 td 所处的位置.先将 tds 转换为数组，再用 indexOf 方法获取当前 td 的位置
        let tdIndex = Array.from(tds).indexOf(currentTd);
        //获取当前 tr 所处的位置
        let trIndex = Array.from(trs).indexOf(currentTr);
        return {"tdIndex":tdIndex,"trIndex":trIndex}
    }

    //table 输入
    function changeCustomTableValue(e){
        const {trIndex,tdIndex} = eventPosition(e);
        let insert = renderData.slice();
        insert[trIndex][renderHead[tdIndex]["title"]] = e.target.value;
        setDynamicData(insert);
    }
    
    //自定义右键菜单
    function forRight(e) {
        //阻止鼠标右键的默认行为
        e.preventDefault()
        //通过修改状态来隐藏或显示右键菜单
        setVisable("block")
        //获取当前鼠标的 x 坐标
        const clickX = e.clientX
        //获取当前鼠标的 y 坐标
        const clickY = e.clientY
        //为 右键菜单 标记了 refs 标签 (rightPanel)。这里引用并设置右键菜单的位置
        //（已经设置 ul 的 position 为 absolute ）。current 是必须要引用的
        rightPanel.current.style.left = clickX + 2 + "px"
        rightPanel.current.style.top = clickY + 2 + "px"
        const {trIndex,tdIndex} = eventPosition(e);
        //更新当前事件的位置
        setTdIndex(tdIndex)
        setTrIndex(trIndex)
        //为 document 添加一个全局点击事件，用来隐藏右键菜单
        document.addEventListener("click",handleDocument)
    }

    function getValue(name,value){
        let tableAmount = props.controlData.tableAmount
        props.getDetails("tableAmount",{...tableAmount,[name]:value})
    }

    //隐藏右键
    function handleDocument(){
        setVisable("none")
        //隐藏后移除全局事件。
        document.removeEventListener("click",handleDocument)
    }

    function changeRow(how){
        return function() {
            let insert = renderData.slice()
            switch (how) {
                case "after":
                    insert.splice(trIndex + 1, 0, {key:uuidv4()});
                    break;
                case "front":
                    insert.splice(trIndex, 0, {key:uuidv4()});
                    break;
                case "remove":
                    insert.splice(trIndex, 1)
                    break;
                default:
                    break;
            }
            setDynamicData(insert);
            setVisable("none");
            getValue("rows",insert.length);
        }
    }

    function changeCol(how){
        return function(){
            let insert = renderHead.slice();
            switch (how) {
                case "after":
                    insert.splice(tdIndex + 1, 0, {key:uuidv4()});
                    break;
                case "front":
                    insert.splice(tdIndex, 0, {key:uuidv4()});
                    break;
                case "remove":
                    insert.splice(tdIndex, 1);
                    break;
                default:
                    break;
            }
            setDynamicHead(insert); 
            setVisable("none");
            getValue("cols",insert.length)
        }
    }

    const {top,right,bottom,left} = props.controlData.padding

    return (
        <div>
            {/* 这里创建右键菜单，默认隐藏 */}
            <div ref={rightPanel} >
                <TableEdit 
                    display={visable}
                    addRowOnTop={changeRow("front")} 
                    // addRowOnTop={change("front",renderData,trIndex,setDynamicData)} 
                    addRowOnBottom={changeRow("after")}
                    addColLeft={changeCol("front")}
                    addColRight={changeCol("after")}
                    removeCurrentRow={changeRow("remove")}
                    removeCurrentCol={changeCol("remove")}
                />
            </div>

            <table>
                <thead>
                    <tr>
                        {renderHead.map((cell) => {
                            return <th key={cell["key"]}>{cell["title"]}</th>
                        })}
                    </tr>
                </thead>
                <tbody ref={tbody}>
                    {renderData.map((perObject) => {
                        return (
                            <tr key={perObject["key"]}>
                                {renderHead.map((cell) => {
                                    return (
                                        <td
                                            style={{
                                                backgroundColor:props.controlData.fill.basicColor,
                                                borderColor:props.controlData.border.basicColor
                                            }}
                                            onContextMenu={forRight}
                                            key={perObject["key"]+cell["key"]}
                                        >
                                            <input type="text" 
                                                value={perObject[cell["title"]]} 
                                                onChange={changeCustomTableValue}
                                                style={{
                                                    color:props.controlData.textStyle.basicColor,
                                                    fontSize:props.controlData.textStyle.fontSize+"px",
                                                    paddingTop:top+"px",
                                                    paddingRight:right+"px",
                                                    paddingBottom:bottom+"px",
                                                    paddingLeft:left+"px"
                                                }}
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}