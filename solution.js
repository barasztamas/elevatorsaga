{
    init: (elevators, floors) => {
        myAddToQueue = (nr, direction, queue)=>{
            if(!queue.includes(nr)) {
                queue.push(nr);
                queue.sort((a,b) => direction*(a-b));
            };
        };
        elevators.sort((e1, e2) => e2.maxPassengerCount()-e1.maxPassengerCount());
        commonQueue = [[],[],[]];
        addToCommonQueue = (nr, direction)=>{
            console.log('addcommon', '-', nr, direction, commonQueue[direction+1]);
            myAddToQueue(nr, direction, commonQueue[direction+1]);
        };
        elevators.forEach((e,i)=>{
            e.index=i;
            e.additionalQueue = [];
            e.queueDirection = 0;
            e.direction = ()=> Math.sign((e.destinationQueue[0]??e.currentFloor()) - e.currentFloor());
            e.showDirection = ()=>{
                e.goingUpIndicator(e.direction()>=0);
                e.goingDownIndicator(e.direction()<=0);
            };
            e.estimatedFreeCapacity = () => (0.8-e.loadFactor())*e.maxPassengerCount()
            e.fitsInDirection = nr => ((nr-(e.destinationQueue[0]??nr))*e.queueDirection>=0 //fits in queue direction
                                       ||(nr-e.currentFloor())*e.direction()>0); //fits in current direction
            e.addDestination = nr => {
                myAddToQueue(nr, e.queueDirection, e.destinationQueue);
                e.checkDestinationQueue();
                e.showDirection();
            };
            e.tryAddDestination = (nr, direction)=>{
                console.log('dest', e.index ,nr, direction, 'start', e.currentFloor(), e.queueDirection, e.direction(), e.estimatedFreeCapacity(), e.destinationQueue);
                if(e.destinationQueue.length==0) {
                    if(nr!=e.currentFloor()) {
                        e.queueDirection=direction;
                        e.addDestination(nr);
                    };
                    console.log('dest', e.index ,nr, direction, 'dest_newque', e.currentFloor(), e.queueDirection, e.direction(), e.estimatedFreeCapacity(), e.destinationQueue);
                    return true;
                };
                if(direction==e.queueDirection && e.estimatedFreeCapacity()>1) {
                    if(e.destinationQueue.includes(nr)){
                        console.log('dest', e.index ,nr, direction, 'dest_includes', e.currentFloor(), e.queueDirection, e.direction(), e.estimatedFreeCapacity(), e.destinationQueue);
                        return true;
                    };
                    if(e.fitsInDirection(nr)) {
                        e.addDestination(nr);
                        console.log('dest', e.index ,nr, direction, 'dest', e.currentFloor(), e.queueDirection, e.direction(), e.estimatedFreeCapacity(), e.destinationQueue);
                        return true;
                    };
                };
                console.log('dest', e.index ,nr, direction, 'false', e.currentFloor(), e.queueDirection, e.direction(), e.estimatedFreeCapacity(), e.destinationQueue);
                return false;
            };
            e.on("floor_button_pressed",nr=>{
                console.log('button', e.index ,nr,'-', 'start', e.currentFloor(), e.queueDirection, e.direction(), e.destinationQueue);
                if(e.destinationQueue.length==0) {
                    if(nr!=e.currentFloor()) {
                        e.queueDirection=Math.sign(nr-e.currentFloor());
                        e.addDestination(nr);
                    };
                    console.log('button', e.index ,nr,'-', 'newque', e.currentFloor(), e.queueDirection, e.direction(), e.destinationQueue);
                    return;
                };
                if(e.destinationQueue.includes(nr)){
                    console.log('button', e.index ,nr,'-', 'dest_includes', e.currentFloor(), e.queueDirection, e.direction(), e.destinationQueue);
                    return;
                };
                if(e.fitsInDirection(nr)) {
                    e.addDestination(nr);
                    console.log('button', e.index ,nr,'-', 'dest', e.currentFloor(), e.queueDirection, e.direction(), e.destinationQueue);
                    return;
                };
                myAddToQueue(nr, -e.queueDirection, e.additionalQueue);
                console.log('button', e.index ,nr,'-', 'additional', e.currentFloor(), e.queueDirection, e.direction(), e.additionalQueue);
                return;
            });
            e.on("stopped_at_floor",nr=>{
                console.log('stop', e.index, nr, 'start', e.queueDirection, e.destinationQueue, e.additionalQueue);
                if(e.destinationQueue.length==0) {
                    newdirection = e.queueDirection==0 ? 1 : -e.queueDirection;
                    e.destinationQueue=e.additionalQueue.splice(0);
                    while(commonQueue[newdirection+1].length>0) {
                        myAddToQueue(commonQueue[newdirection+1].splice(0,1), newdirection, e.destinationQueue);
                    };
                    if(e.destinationQueue.length==0) {
                        newdirection = -newdirection;
                        e.destinationQueue=commonQueue[newdirection+1].splice(0);
                    };
                    if(e.destinationQueue.length==0) {
                        newdirection = 0;
                        if(e.currentFloor()!=0) {
                            myAddToQueue(0, 0, e.destinationQueue);
                            newdirection = -1;
                        };
                    };
                    e.queueDirection=newdirection;
                    e.checkDestinationQueue();
                };
                e.showDirection();
                console.log('stop', e.index, nr, 'finish', e.queueDirection, e.destinationQueue, e.additionalQueue);
            });
        });
        floors.forEach(f=>{
            f.myButtonPressed = (direction)=>{
                console.log('floorbutton','-', f.floorNum(),direction);
                elevators
                    .sort((e1, e2) => (e1.estimatedFreeCapacity()-e1.destinationQueue.length*1.5) - (e2.estimatedFreeCapacity()-e2.destinationQueue.length*1.5))
                    .reduce((b,e)=>b||(e.tryAddDestination(f.floorNum(),direction)),false)
                    ||addToCommonQueue(f.floorNum(),direction);
            };
            f.on("up_button_pressed", ()=>f.myButtonPressed(1));
            f.on("down_button_pressed", ()=>f.myButtonPressed(-1));
        });

    },
        update: (dt, elevators, floors) => {

        }
}