import sketch from 'sketch';
import {ShapePath, Color, Layer, SymbolMaster,SymbolInstance,Document,Text,Group } from 'sketch/dom';

const selectedDocument = Document.getSelectedDocument();
const selectedPages = selectedDocument.pages;
const selectedLayers = sketch.getSelectedDocument().selectedLayers.layers;
const symbols = context.document.currentPage().symbols();

//
function fix(item,positionArr){
    let itemNative = item.sketchObject;
    itemNative.hasFixedLeft = false;
    itemNative.hasFixedRight = false;
    itemNative.hasFixedTop = false;
    itemNative.hasFixedBottom = false;
    itemNative.hasFixedWidth = false;
    itemNative.hasFixedHeight = false;

    for(let i=0;i<positionArr.length;i++){
        switch (positionArr[i]) {
            case "left":
                itemNative.hasFixedLeft = true;
                break;
            case "right":
                itemNative.hasFixedRight = true;
                break;
            case "top":
                itemNative.hasFixedTop = true;
                break;
            case "bottom":
                itemNative.hasFixedBottom = true;
                break;
            case "width":
                itemNative.hasFixedWidth = true;
                break;
            case "height":
                itemNative.hasFixedHeight = true;
                break;
            default:
                break;
        }
    }
}

export default function(){

    //定义表格背景
    const cellBg = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "cellBg",
        frame: {
            x: 0,
            y: 0,
            width: 120,
            height: 40,
        },
        style: {
            fills: [
                {
                    fillType: Color,
                    enabled: true,
                    color: "#ffffff",
                }
            ],
            borders: [],
            styleType: Layer,
        },
    });
    
    const cellText = new Text({
        text: "text",
        name: "layerName",
        style: {
          textColor:"#000000",
          fontSize: 14,
          borders: [],
        }
    });
    cellText.adjustToFit();
    cellText.frame.x = 8;
    cellText.frame.y = (cellBg.frame.height - cellText.frame.height) / 2;
    
    const borderBottom = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "borderBottom",
        frame: {
            x: 0,
            y: cellBg.frame.height - 1,
            width: 120,
            height: 1,
        },
        style: {
            fills: [
            {
                fillType: Color,
                enabled: true,
                color: "#eeeeee",
            }
            ],
            borders: [],
            styleType: Layer,
        },
    })
    

    const borderRight = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "borderRight",
        frame: {
            x: cellBg.frame.width - 1,
            y: 0,
            width: 1,
            height: 40,
        },
        style: {
            fills: [
            {
                fillType: Color,
                enabled: true,
                color: "#eeeeee",
            }
            ],
            borders: [],
            styleType: Layer,
        },
    })
    
    fix(cellBg,["left","right","top","bottom"]);
    fix(cellText,["left"]);
    fix(borderBottom,["bottom","height"]);
    fix(borderRight,["right","width"]);

    let symbolsPosition = [],currentSymbolPosition = 0;

    if(symbols.count() > 0) {
        for(let i=0;i<symbols.count();i++){
            let symbol = sketch.fromNative(symbols[i]);
            symbolsPosition.push(symbol.frame.x + symbol.frame.width);
        };
        currentSymbolPosition = Math.max(...symbolsPosition) + 100;
    }

    var symbol = new SymbolMaster({
        name:"TD",
        layers:[cellBg,cellText,borderBottom,borderRight],
        parent:selectedPages[0],
        frame:{
            x:currentSymbolPosition,
            y:0,
            width:cellBg.frame.width,
            height:cellBg.frame.height
        },
    });

    // var instance = symbol.createNewInstance();

    var instance = new SymbolInstance({
        name:"symbolInstance",
        parent:selectedLayers[0],
        frame: {
            x: 0,
            y: 0,
            width: symbol.frame.width,
            height: symbol.frame.height
        },
        master:symbol
    })

    var duplicatedLayer = instance.duplicate();

    const override = {
        value:"啊哈"
    }

    
    instance.overrides[0] = Object.assign(instance.overrides[0],override);
    instance.setOverrideValue(instance.overrides[0],"打你娃儿哟")
    duplicatedLayer.setOverrideValue(duplicatedLayer.overrides[0],"你个憨批")
    

    var group = new Group({
        name: 'group',
        parent:selectedLayers[0],
        frame: {
          x: 0,
          y: 0,
          width: instance.frame.width,
          height: instance.frame.height
        },
        layers: [instance],
    })

    console.log(instance.overrides)

    console.log(duplicatedLayer)
}

