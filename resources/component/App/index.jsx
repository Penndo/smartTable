import * as React from "react"
import Table from "../Table"
import ConstrolSlider from "../ConstrolSlider"
import "./index.less"
import { useState } from "react"


export default function App(){

    const [controlData, setControlData] = useState({
        tableWidth:"640",
        tableAmount:{
            cols:"4",
            rows:"5"
        },
        dataFrom:{
            api:"https://randomuser.me/api/?results=5&inc=",
            parameter:"gender,email,nat,phone"
        },
        padding:{
            top:"8",
            right:"8",
            bottom:"8",
            left:"8"
        },
        fill:{
            basicColor:"#FFFFFF",
            intervalColor:""
        },
        border:{
            basicColor:"#D8D8D8",
            intervalColor:""
        },
        textStyle:{
            basicColor:"#333333",
            fontSize:"14",
            fontWeight:"normal"
        }
    })

    //更新样式表
    function getDetails(name,data){
        // console.log(dataDetails)
        setControlData({
            ...controlData,[name]:data
        })
    }

    const [renderData, setRenderData] = useState([])

    const getRenderData = React.useCallback(
        (data) => {
            setRenderData(data);
        },[])

    return (
        <div>
            <Table controlData={controlData} getDetails={getDetails} getRenderData={getRenderData}/>
            <ConstrolSlider controlData={controlData} getDetails={getDetails} renderData={renderData}/>
        </div>
    )
}