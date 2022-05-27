import UI from 'sketch/ui';
import {getMaxValue} from './Help';

export default function () {
    const selection = context.selection;

    if(selection.count() == 0){
        UI.message("❗️ 请选择至少一个 smartTable 表格");
        return;
    }

    selection.forEach((selection)=>{

        const smartTableContainedLayers = selection.layers();

        var standardStruct = smartTableContainedLayers.every((layerGroup)=>
            layerGroup.className() == "MSLayerGroup" &&
            layerGroup.layers().every((row)=>
                row.className() == "MSLayerGroup" && 
                row.layers().every((instance) => instance.className() == "MSSymbolInstance")
            )
        )

        if(standardStruct == false){
            UI.message("🙊 你选择了非标准的 smartTable 表格");
            return;
        }else{
            const children = selection.children();
            let predicate = NSPredicate.predicateWithFormat("name == %@", "row");
            let rows = children.filteredArrayUsingPredicate(predicate);

            rows = Array.from(rows);
            rows.sort((a,b)=>{
                return a.absoluteRect().y() - b.absoluteRect().y();
            });
        
            //获取全局坐标，因为 thead 和 tbody 是两个同级的 layerGroup。如果用相对坐标会导致位置排序混乱。
            let rowY = selection.absoluteRect().y();
        
            rows.forEach(row => {
                let cellX = selection.absoluteRect().x();
                let cellY = row.absoluteRect().y();
                let heights = [];

                //调整每个组件实例以适配内容
                let cells = row.layers();
                cells.forEach(cell => {
                    cell.resizeToFitContentsIfNeeded();
                    heights.push(cell.frame().rect().size.height)
                });
        
                let maxHeight = getMaxValue(heights);

                //设置位置
                cells.forEach(cell => {
                    cell.absoluteRect().setX(cellX);
                    cell.absoluteRect().setY(cellY);
                    if(cell.frame().rect().size.height != maxHeight){
                        cell.frame().setHeight(maxHeight);
                    }
                    cellX += cell.frame().width();
                })
        
                row.absoluteRect().setY(rowY);
                rowY += maxHeight;
            });
        
            selection.layers().forEach((el)=>{
                el.layerDidEndResize();
            })

            UI.message("😌 这下舒服了");
        }  
    })
}


